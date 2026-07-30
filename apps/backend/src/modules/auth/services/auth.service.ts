import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/services/user.service";
import { SignupDto } from "../dtos/signup.dto";
import { SigninDto } from "../dtos/signin.dto";
import * as bcrypt from "bcrypt";
import { SubscriptionsService } from "src/modules/subscriptions/services/subscriptions.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  async signup(signupDto: SignupDto) {
    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(signupDto.password, saltOrRounds);

    const user = await this.userService.createUser(signupDto.email, passwordHash);
    await this.subscriptionsService.addFreeSubscriptionToUser(user.id);

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async signin(signinDto: SigninDto) {
    const user = await this.userService.findUserByEmail(signinDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(signinDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
