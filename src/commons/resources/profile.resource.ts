import { Expose } from 'class-transformer';

export class ProfileDto {
  @Expose()
  uid: string;

  @Expose({ name: 'first_name' })
  firstName: string;

  @Expose({ name: 'last_name' })
  lastName: string;

  @Expose({ name: 'email' })
  email: string;
}
