import { AppModule } from "@/app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "@shared/filters/allExceptions.filter";
import { ResponseInterceptor } from "@shared/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle("Ux Software")
    .setDescription("E-commerce simulation API")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/doc", app, documentFactory);

  const port = process.env.API_PORT ?? 3000;

  await app.listen(port);

  Logger.debug(`Server is listening on http://localhost:${port}/`);
  Logger.debug(`Visit swagger on http://localhost:${port}/doc/`);
}
void bootstrap();
