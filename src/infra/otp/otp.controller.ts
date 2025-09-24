import { VerifyOtpDTO } from "@/infra/otp/dtos/otp.dto";
import { OtpService } from "@/infra/otp/otp.service";
import { Body, Controller, Post } from "@nestjs/common";

@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post("verify")
  async verifyOtp(@Body() payload: VerifyOtpDTO) {
    const data = await this.otpService.verifyOtp(payload.email, payload.otp);

    return {
      data,
      message: "OTP successfully verified",
    };
  }
}
