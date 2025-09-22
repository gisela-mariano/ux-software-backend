import { AppModule } from "@/app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
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

  await app.listen(process.env.API_PORT ?? 3000);
}
void bootstrap();
