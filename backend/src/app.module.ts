import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { ApiModule } from './api/api.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    DatabaseModule,
    AuthModule,
    ApiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
