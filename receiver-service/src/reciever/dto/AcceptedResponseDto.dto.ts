import { ApiProperty } from '@nestjs/swagger';

export class AcceptedResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the request',
    example: 'b74bd9c2-8590-4149-9628-3f738099831a',
  })
  id: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 202,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Descriptive message about the request status',
    example: 'Request has been accepted for processing.',
  })
  message: string;
}
