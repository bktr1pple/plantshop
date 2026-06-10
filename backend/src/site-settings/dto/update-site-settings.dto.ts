import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

const SAFE_NAVIGATION_URL =
  /^(?:\/(?!\/)[^\s]*|#[A-Za-z0-9_:-]*|https:\/\/[^\s]+|mailto:[^\s@]+@[^\s@]+|tel:\+?[0-9 ()-]{7,20})$/i;

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateSiteSettingsDto {
  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  siteName?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(240)
  siteTagline?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  heroTitleLine1?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  heroTitleLine2?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  heroTitleLine3?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  heroSubtitle?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  heroPrimaryCtaLabel?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_NAVIGATION_URL)
  heroPrimaryCtaHref?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  contactIntro?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  footerDescription?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  footerCtaLabel?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_NAVIGATION_URL)
  footerCtaHref?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(40)
  contactPhoneDisplay?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(40)
  @Matches(/^tel:\+?[0-9 ()-]{7,20}$/i)
  contactPhoneHref?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsEmail()
  @MaxLength(191)
  contactEmail?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(240)
  contactAddress?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(240)
  showroomHours?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  messengerLabel?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_NAVIGATION_URL)
  messengerUrl?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  facebookUrl?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  instagramUrl?: string;
}
