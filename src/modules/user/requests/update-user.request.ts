import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateUserRequestDto } from "./create-user.request";

export class UpdateUserRequestDto extends PartialType(
  OmitType(CreateUserRequestDto, ['email'] as const),
) {}