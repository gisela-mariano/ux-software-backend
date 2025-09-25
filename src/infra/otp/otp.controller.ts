import { OtpService } from "@/infra/otp/otp.service";
import { ApiSuccessResponseWrapped } from "@/shared/decorators/apiResponse.decorator";
import { Public } from "@/shared/decorators/isPublic.decorator";
import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";

@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @ApiSuccessResponseWrapped(Boolean)
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get("verify/:email/:otp")
  async verifyOtp(@Param("email") email: string, @Param("otp") otp: string) {
    const data = await this.otpService.verifyOtp(email, otp);

    return {
      data,
      message: "OTP successfully verified",
    };
  }
}
