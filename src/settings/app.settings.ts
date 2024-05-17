import * as process from 'process';
import * as passport from 'passport';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

import { AppModule } from '../app.module';
import { customExceptionFactory } from '../infrastructure/exception-filters/exception-factory';
import { HttpExceptionFilter } from '../infrastructure/exception-filters/http-exception-filter';

config();

export const APP_PREFIX = '/api/v1';

export type EnvironmentVariable = {
  [key: string]: string | undefined;
};

export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';

export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

class APISettings {
  public readonly APP_PORT: number;

  public readonly DATABASE_URL: string;
  public readonly TEST_DATABASE_URL: string;

  public readonly GOOGLE_CLIENT_SECRET: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    this.APP_PORT = this.getNumberOrDefault(this.envVariables.APP_PORT);

    this.DATABASE_URL = this.envVariables.DATABASE_URL;
    this.TEST_DATABASE_URL = this.envVariables.TEST_DATABASE_URL;

    this.GOOGLE_CLIENT_SECRET = this.envVariables.GOOGLE_CLIENT_SECRET;
  }

  private getNumberOrDefault(value: string): number {
    return Number(value);
  }
}

export class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}

  applySettings(app: INestApplication) {
    const corsWhiteList = ['http://localhost:3000'];

    app.enableCors({
      origin: corsWhiteList,
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Origin',
        'X-Requested-With',
        'Accept',
        'Authorization',
      ],
      exposedHeaders: ['Authorization'],
      methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
      maxAge: 3600,
    });

    app.use(cookieParser());

    app.use(
      session({
        secret: this.api.GOOGLE_CLIENT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    this.setAppPrefix(app);
    this.setSwagger(app);
    this.setAppPipes(app);

    setAppExceptionsFilters(app);
  }

  private setAppPrefix(app: INestApplication) {
    app.setGlobalPrefix(APP_PREFIX);
  }

  private setSwagger(app: INestApplication) {
    const swaggerPath = APP_PREFIX + '/doc';

    const config = new DocumentBuilder()
      .setTitle('Trello API')
      .addBearerAuth()
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Trello API Documentation',
    });
  }

  private setAppPipes(app: INestApplication) {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: customExceptionFactory,
      }),
    );
  }
}

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};

const env = new EnvironmentSettings(
  (Environments.includes(process.env.ENV)
    ? process.env.ENV
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);

export const appSettings = new AppSettings(env, api);
