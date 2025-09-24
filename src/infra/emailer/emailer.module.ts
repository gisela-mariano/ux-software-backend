import { EmailerConfigService } from "@/infra/emailer/emailerConfig.service";
import { BullQueueNames } from "@/infra/emailer/interfaces/emailer.interface";
import { SendEmailConsumerProcessor } from "@/infra/emailer/processors/sendEmailConsumer.processor.service";
import { SendOtpEmailQueueProducerService } from "@/infra/emailer/queueServices/sendOtpEmailQueueProducer.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    BullModule.registerQueue({ name: BullQueueNames.SEND_OTP_EMAIL }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const emailerConfigService = new EmailerConfigService(config);
        return await emailerConfigService.getMailerConfig();
      },
    }),
  ],
  providers: [EmailerConfigService, SendEmailConsumerProcessor, SendOtpEmailQueueProducerService],
  exports: [SendEmailConsumerProcessor, SendOtpEmailQueueProducerService],
})
export class EmailerModule {}
