[CmdletBinding()]
param(
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\')
$rootPrefix = $repoRoot + [System.IO.Path]::DirectorySeparatorChar

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $target = Join-Path $repoRoot 'plantshop.zip'
} elseif ([System.IO.Path]::IsPathRooted($OutputPath)) {
  $target = $OutputPath
} else {
  $target = Join-Path $repoRoot $OutputPath
}

$target = [System.IO.Path]::GetFullPath($target)
$temp = [System.IO.Path]::GetFullPath($target + '.tmp')

foreach ($path in @($target, $temp)) {
  if (-not $path.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Archive path is outside the repository: $path"
  }
}

if (Test-Path -LiteralPath $temp) {
  Remove-Item -LiteralPath $temp -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$excludedDirectories = @(
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'output',
  'playwright-report',
  'test-results',
  'uploads'
)

function Get-RepositoryRelativePath {
  param([string]$FullName)

  if (-not $FullName.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "File is outside the repository: $FullName"
  }

  return $FullName.Substring($rootPrefix.Length)
}

function Test-SafeSourceFile {
  param([System.IO.FileInfo]$File)

  $relative = Get-RepositoryRelativePath -FullName $File.FullName
  $parts = $relative -split '[\\/]'

  if ($parts | Where-Object { $excludedDirectories -contains $_ }) {
    return $false
  }

  if ($File.FullName -eq $target -or $File.FullName -eq $temp) {
    return $false
  }

  if ($File.Extension -in @('.zip', '.log', '.tmp', '.temp', '.tsbuildinfo')) {
    return $false
  }

  if (
    $File.Name -eq '.env' -or
    ($File.Name.StartsWith('.env.') -and $File.Name -ne '.env.example')
  ) {
    return $false
  }

  if (
    $File.Name.StartsWith('~$') -or
    $File.Name -in @('.DS_Store', 'Thumbs.db', 'next-env.d.ts')
  ) {
    return $false
  }

  if ($relative -like 'plantshop_analysis_report.*') {
    return $false
  }

  return $true
}

$files = @(
  Get-ChildItem -LiteralPath $repoRoot -Recurse -File -Force |
    Where-Object { Test-SafeSourceFile -File $_ }
)

$archive = [System.IO.Compression.ZipFile]::Open(
  $temp,
  [System.IO.Compression.ZipArchiveMode]::Create
)

try {
  foreach ($file in $files) {
    $entryName = (Get-RepositoryRelativePath -FullName $file.FullName).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive,
      $file.FullName,
      $entryName,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
} finally {
  $archive.Dispose()
}

Move-Item -LiteralPath $temp -Destination $target -Force

$verificationArchive = [System.IO.Compression.ZipFile]::OpenRead($target)

try {
  $unsafeEntries = @(
    $verificationArchive.Entries | Where-Object {
      $entryName = $_.FullName
      $leafName = [System.IO.Path]::GetFileName($entryName)
      $parts = $entryName -split '/'

      ($parts | Where-Object { $excludedDirectories -contains $_ }) -or
      $leafName -eq '.env' -or
      ($leafName.StartsWith('.env.') -and $leafName -ne '.env.example') -or
      $entryName.EndsWith('.zip') -or
      $entryName.EndsWith('.tsbuildinfo') -or
      $leafName -eq 'next-env.d.ts'
    }
  )

  if ($unsafeEntries.Count -gt 0) {
    $entryList = ($unsafeEntries | Select-Object -ExpandProperty FullName) -join ', '
    throw "Unsafe archive entries: $entryList"
  }

  [PSCustomObject]@{
    Archive = $target
    Files = $verificationArchive.Entries.Count
    SizeBytes = (Get-Item -LiteralPath $target).Length
    UnsafeEntries = $unsafeEntries.Count
  }
} finally {
  $verificationArchive.Dispose()
}
