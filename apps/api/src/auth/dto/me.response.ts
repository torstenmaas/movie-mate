import { ApiProperty } from '@nestjs/swagger'

export class MeResponse {
  @ApiProperty({ example: 'uuid-123' })
  sub!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string
}
