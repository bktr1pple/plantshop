import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PlantsModule } from './plants/plants.module';
import { MediaModule } from './media/media.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { OrdersModule } from './orders/orders.module';
import { ThrottlerExceptionFilter } from './filters/throttler-exception.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'global',
          ttl: 60_000, // 1 хвилина
          limit: 1000, // максимум 1000 запитів за ttl
        },
      ],
    }),
    AuthModule,
    PrismaModule,
    PlantsModule,
    MediaModule,
    SiteSettingsModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter, // ✅ підключення твого кастомного фільтра
    },
  ],
})
export class AppModule {}
