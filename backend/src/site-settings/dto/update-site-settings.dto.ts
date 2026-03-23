import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteTagline?: string;

  @IsOptional()
  @IsString()
  heroTitleLine1?: string;

  @IsOptional()
  @IsString()
  heroTitleLine2?: string;

  @IsOptional()
  @IsString()
  heroTitleLine3?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  heroPrimaryCtaLabel?: string;

  @IsOptional()
  @IsString()
  heroPrimaryCtaHref?: string;

  @IsOptional()
  @IsString()
  contactIntro?: string;

  @IsOptional()
  @IsString()
  footerDescription?: string;

  @IsOptional()
  @IsString()
  footerCtaLabel?: string;

  @IsOptional()
  @IsString()
  footerCtaHref?: string;

  @IsOptional()
  @IsString()
  contactPhoneDisplay?: string;

  @IsOptional()
  @IsString()
  contactPhoneHref?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactAddress?: string;

  @IsOptional()
  @IsString()
  showroomHours?: string;

  @IsOptional()
  @IsString()
  messengerLabel?: string;

  @IsOptional()
  @IsString()
  messengerUrl?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;
}
