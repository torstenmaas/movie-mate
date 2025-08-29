import { ApiProperty } from '@nestjs/swagger'

export class RegisterBody {
  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiProperty({ example: 'VeryStrongPassw0rd', minLength: 12 })
  password!: string

  @ApiProperty({ example: 'Max Mustermann' })
  displayName!: string

  @ApiProperty({ enum: ['de', 'en'], required: false, default: 'de' })
  preferredLocale?: 'de' | 'en'

  @ApiProperty({ example: true })
  acceptTerms!: true

  @ApiProperty({ required: false, default: false })
  marketingOptIn?: boolean
}
