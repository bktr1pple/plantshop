import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlantsModule } from './plants/plants.module';

@Module({
  imports: [AuthModule, PrismaModule, PlantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
