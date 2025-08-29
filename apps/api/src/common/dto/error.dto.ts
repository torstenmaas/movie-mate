import { ApiProperty } from '@nestjs/swagger'

export class ErrorDto {
  @ApiProperty({ example: 422 })
  statusCode!: number

  @ApiProperty({ example: 'GEN_VALIDATION_FAILED' })
  error!: string

  @ApiProperty({ example: 'Invalid input' })
  message!: string

  @ApiProperty({ required: false, nullable: true })
  details?: unknown

  @ApiProperty({ example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab' })
  traceId?: string
}
