import { ConfigService } from "@nestjs/config";

type RedisData = {
  type: "single";
  url: string;
  host: string;
  port: number;
  maxRetriesPerRequest: number;
};

export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  getRedisData(): RedisData {
    const type = "single";
    const host = this.configService.get<string>("REDIS_HOST") ?? "localhost";
    const port = Number(this.configService.get<string>("REDIS_PORT") ?? 6379);
    const url = this.configService.get<string>("REDIS_URL") ?? `redis://${host}:${port}`;
    const maxRetriesPerRequest = 2;

    return { type, url, host, port, maxRetriesPerRequest };
  }
}
