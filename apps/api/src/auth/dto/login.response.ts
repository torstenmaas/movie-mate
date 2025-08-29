import { ApiProperty } from '@nestjs/swagger'
import { UserDto } from './user.swagger'

export class LoginResponse {
  @ApiProperty({ type: UserDto })
  user!: UserDto

  @ApiProperty({ example: 'eyJhbGciOi...' })
  accessToken!: string

  @ApiProperty({ example: 'eyJhbGciOi...refresh' })
  refreshToken!: string
}
