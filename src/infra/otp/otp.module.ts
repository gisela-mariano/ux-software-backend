import { EmailerModule } from "@/infra/emailer/emailer.module";
import { OtpController } from "@/infra/otp/otp.controller";
import { OtpService } from "@/infra/otp/otp.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [EmailerModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
