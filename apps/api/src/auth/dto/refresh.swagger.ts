import { ApiProperty } from '@nestjs/swagger'

export class RefreshBody {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  refreshToken!: string
}
