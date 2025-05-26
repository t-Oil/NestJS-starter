import { IsNotEmpty, IsString } from "class-validator";

export class RefreshLoginRequest {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}