import { BullQueueNames, SendOtpEmailHandler } from "@/infra/emailer/interfaces/emailer.interface";
import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bull";

@Injectable()
export class SendOtpEmailQueueProducerService {
  constructor(
    @InjectQueue(BullQueueNames.SEND_OTP_EMAIL)
    private readonly mailQueue: Queue,
  ) {}

  async execute({ email, name, otp, expiresIn }: SendOtpEmailHandler) {
    await this.mailQueue.add(BullQueueNames.SEND_OTP_EMAIL, {
      email,
      name,
      otp,
      expiresIn,
    });
  }
}
