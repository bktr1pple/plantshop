import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { SiteSettingsService } from './site-settings.service';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get('public')
  async getPublicSettings() {
    return this.siteSettingsService.getPublicSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAdminSettings() {
    return this.siteSettingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch()
  async updateSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.updateSettings(dto);
  }
}
