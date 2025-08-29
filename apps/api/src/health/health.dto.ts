import { ApiProperty } from '@nestjs/swagger'

export class HealthStatusDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: 'ok' | 'error'

  @ApiProperty({ example: '2025-08-29T19:40:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'movie-mate' })
  version!: string

  @ApiProperty({ example: 'a1b2c3d', required: false, nullable: true })
  commit?: string

  @ApiProperty({ example: 'ok', enum: ['ok', 'down'] })
  db!: 'ok' | 'down'
}
