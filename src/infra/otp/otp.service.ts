import { SendOtpEmailQueueProducerService } from "@/infra/emailer/queueServices/sendOtpEmailQueueProducer.service";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { BadRequestException, Injectable } from "@nestjs/common";
import Redis from "ioredis";

type SendOtpEmail = {
  email: string;
  name: string;
};

const ONE_MINUTE = 60;

@Injectable()
export class OtpService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly sendOtpEmailService: SendOtpEmailQueueProducerService,
  ) {}

  async sendOtp({ email, name }: SendOtpEmail): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = ONE_MINUTE * 5;

    await this.redis.set(`otp:${email}`, otp, "EX", expiresIn);

    await this.sendOtpEmailService.execute({
      email,
      name,
      otp,
      expiresIn,
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redis.get(`otp:${email}`);

    if (!storedOtp) {
      throw new BadRequestException("Code expired or does not exist");
    }

    if (storedOtp !== otp) {
      throw new BadRequestException("Invalid code");
    }

    await this.redis.del(`otp:${email}`);

    return true;
  }
}
