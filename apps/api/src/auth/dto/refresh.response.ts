import { ApiProperty } from '@nestjs/swagger'

export class RefreshResponse {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  accessToken!: string

  @ApiProperty({ example: 'eyJhbGciOi...refresh' })
  refreshToken!: string
}
