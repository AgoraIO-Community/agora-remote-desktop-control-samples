import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { HealthController } from './health.controller';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

const __PROD__ = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: __PROD__ ? undefined : ['.env.development.local'],
      ignoreEnvFile: __PROD__,
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        Logger.debug(`REDIS_HOST: ${configService.get('REDIS_HOST')}`);
        Logger.debug(`REDIS_PORT: ${configService.get('REDIS_PORT')}`);
        Logger.debug(`REDIS_PASSWORD: ${configService.get('REDIS_PASSWORD')}`);
        return {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [SessionController, HealthController],
  providers: [SessionService],
})
export class AppModule {}
