import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(@Param("id") id: string) {
    const user = await this.userService.findUserById(id);
    if (user) {
      // Don't return password hash
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }
}
