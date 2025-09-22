import { DatabaseConfigService } from "@/infra/database/databaseConfig.service";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

config();

const configService = new ConfigService();

const databaseService = new DatabaseConfigService(configService);
const dataSourceOptions = databaseService.getTypeOrmConfig() as DataSourceOptions;

export default new DataSource(dataSourceOptions);
