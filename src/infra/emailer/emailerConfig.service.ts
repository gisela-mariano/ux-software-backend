import { hasEmptyKey } from "@/utils/checkers/object";
import { MailerOptions } from "@nestjs-modules/mailer";
import { TransportType } from "@nestjs-modules/mailer/dist/interfaces/mailer-options.interface";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTestAccount, TestAccount } from "nodemailer";

@Injectable()
export class EmailerConfigService {
  constructor(private configService: ConfigService) {}

  public async getMailerConfig(): Promise<MailerOptions> {
    const transport = await this.getTransportConfig();

    return {
      transport,
      defaults: {
        from: this.configService.get<string>("MAIL_FROM") ?? "Default Sender",
      },
    };
  }

  private async getTransportConfig(): Promise<TransportType> {
    const envTransporterData = {
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: false,
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      },
    };

    const isMissingValue = hasEmptyKey(envTransporterData);

    if (isMissingValue) {
      const testAccount = await this.createAccount();

      const data = {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };

      Logger.warn(
        `Há informações faltantes no arquivo .env para o envio de email. Por isso foi gerado as seguintes informações: ${JSON.stringify(data)}`,
      );

      return data;
    }

    return envTransporterData;
  }

  private async createAccount(): Promise<TestAccount> {
    try {
      const account = await createTestAccount();
      return account;
    } catch (err) {
      Logger.error("Failed to create a testing account. " + (err as Error).message);
      process.exit(1);
    }
  }
}
