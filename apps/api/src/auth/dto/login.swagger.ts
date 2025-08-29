import { ApiProperty } from '@nestjs/swagger'

export class LoginBody {
  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiProperty({ example: 'VeryStrongPassw0rd' })
  password!: string
}
