// api-docs.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as apiDocsCreator from 'api-docs-creator';

@Module({
  imports: [ConfigModule],
})
export class ApiDocsModule implements NestModule {
  constructor(private configService: ConfigService) { }

  configure(consumer: MiddlewareConsumer) {
    const apiDocsMiddleware = apiDocsCreator({
      name: this.configService.get('APP_NAME', 'NestJS API'),
      description: 'API documentation with authentication',
      version: this.configService.get('APP_VERSION', '1.0.0'),
      baseUrl: this.configService.get('API_BASE_URL'),
      allowExternalEdit: this.configService.get('NODE_ENV') === 'development',
      theme: 'dark',
      primaryColor: '#e53e3e', // NestJS red
    });

    consumer
      .apply(apiDocsMiddleware)
      .forRoutes('/api-docs');
  }
}