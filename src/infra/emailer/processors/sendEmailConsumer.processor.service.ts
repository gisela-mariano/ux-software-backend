import type { SendOtpEmailHandler } from "@/infra/emailer/interfaces/emailer.interface";
import { BullQueueNames } from "@/infra/emailer/interfaces/emailer.interface";
import { MailerService } from "@nestjs-modules/mailer";
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import type { Job } from "bull";

@Processor(BullQueueNames.SEND_OTP_EMAIL)
export class SendEmailConsumerProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process(BullQueueNames.SEND_OTP_EMAIL)
  async handleSendOtpEmail(job: Job<SendOtpEmailHandler>) {
    const { name, email, otp, expiresIn } = job.data;

    const verificationLink = `http://localhost:${process.env.API_PORT ?? 3000}/otp/verify/${email}/${otp}`;

    await this.mailerService.sendMail({
      to: email,
      subject: `Hello, ${name}!`,
      text: `Hello, ${name}, welcome!\n\nYour OTP code is ${otp}. It expires in ${expiresIn / 60} minutes.\n\nVerification link: ${verificationLink}`,
    });
  }

  @OnQueueActive()
  onActive(job: Job<{ id: string; name: string }>) {
    Logger.warn(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<{ id: string; name: string }>, error: Error) {
    Logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<{ id: string; name: string }>) {
    Logger.warn(`Completed job ${job.id} of type ${job.name}`);
  }
}
