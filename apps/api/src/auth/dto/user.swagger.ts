import { ApiProperty } from '@nestjs/swagger'

export class UserDto {
  @ApiProperty({ example: 'uuid-123' })
  id!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiProperty({ example: 'Max Mustermann' })
  displayName!: string

  @ApiProperty({ enum: ['de', 'en'], example: 'de' })
  preferredLocale!: 'de' | 'en'

  @ApiProperty({ example: false })
  emailVerified!: boolean

  @ApiProperty({ example: '2025-08-29T09:37:29.089Z' })
  createdAt!: string
}
