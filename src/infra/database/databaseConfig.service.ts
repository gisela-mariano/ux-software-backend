import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import path from "path";

enum EnvironmentKeys {
  POSTGRES_HOST = "POSTGRES_HOST",
  POSTGRES_PORT = "POSTGRES_PORT",
  POSTGRES_USER = "POSTGRES_USER",
  POSTGRES_PASSWORD = "POSTGRES_PASSWORD",
  POSTGRES_DB = "POSTGRES_DB",
}

export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  private getValue(key: string): string {
    const value: string | undefined = this.configService.get(key);

    if (!value) {
      throw new Error(`Config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k));
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    this.ensureValues([
      EnvironmentKeys.POSTGRES_HOST,
      EnvironmentKeys.POSTGRES_PORT,
      EnvironmentKeys.POSTGRES_USER,
      EnvironmentKeys.POSTGRES_PASSWORD,
      EnvironmentKeys.POSTGRES_DB,
    ]);

    const hostsToDisableSsl = ["localhost", "db"];

    const ssl = !hostsToDisableSsl.includes(this.getValue(EnvironmentKeys.POSTGRES_HOST));

    return {
      type: "postgres",
      host: this.getValue(EnvironmentKeys.POSTGRES_HOST),
      port: Number(this.getValue(EnvironmentKeys.POSTGRES_PORT)),
      username: this.getValue(EnvironmentKeys.POSTGRES_USER),
      password: this.getValue(EnvironmentKeys.POSTGRES_PASSWORD),
      database: this.getValue(EnvironmentKeys.POSTGRES_DB),
      entities: [path.resolve(__dirname, "../../modules/**/*.entity{.ts,.js}")],
      migrations: [path.resolve(__dirname, "./migrations/**/*{.ts,.js}")],
      synchronize: false,
      ssl,
    };
  }
}
