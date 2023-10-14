import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.config.getOrThrow<string>('POSTGRES_DB_URL'),
      entities: [User],
      migrationsTableName: 'typeorm_migrations',
      logger: 'file',
      autoLoadEntities: false,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
      migrations: ['src/migrations/**/*{.ts,.js}'],
    };
  }
}
