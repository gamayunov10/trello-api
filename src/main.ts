import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { appSettings } from './settings/app.settings';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  appSettings.applySettings(app);

  await app.listen(appSettings.api.APP_PORT, () => {
    logger.log(
      `App starting listen port: ${appSettings.api.APP_PORT} | ENV: ${appSettings.env.getEnv()}`,
    );
  });
}
bootstrap();
