import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from '../users/dtos/user.dto';
import { SignInDto } from './dtos/auth.dto';
import { NewPasswordResetTokenDTO, PasswordResetDTO } from './dtos/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<void> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto);
  }

  @Post('/password-reset')
  createPasswordResetToken(@Body() newPasswordResetTokenDTO: NewPasswordResetTokenDTO): Promise<void> {
    return this.authService.newPasswordResetToken(newPasswordResetTokenDTO);
  }

  @Patch('/password-reset')
  passwordReset(@Body() passwordResetDTO: PasswordResetDTO): Promise<void> {
    return this.authService.passwordReset(passwordResetDTO);
  }
}
