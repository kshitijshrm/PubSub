import { Controller, Post, Body, UseInterceptors, HttpCode, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentTransformInterceptor } from '../common/interceptor/document-transform.interceptor';
import { ServiceConstants } from '../common/constants/service.constants';
import { AcceptedResponseDto } from './dto/AcceptedResponseDto.dto';

@ApiTags('receiver')
@Controller('receiver')
@UseInterceptors(DocumentTransformInterceptor)
@ApiHeader({
  name: ServiceConstants.userId_header,
  description: 'User Id',
  required: true
})
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) { }

  @Post()
  @HttpCode(202)
  @ApiResponse({
    status: 202,
    description: 'Accepted for processing',
    type: AcceptedResponseDto,
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors) => {
        const messages = validationErrors.map((error) => {
          if (error.constraints) {
            return `Field "${error.property}": ${Object.values(error.constraints).join(', ')}`;
          } else {
            return `Extra field "${error.property}" is not allowed.`;
          }
        });

        return new BadRequestException({
          statusCode: 400,
          message: messages.join(","),
          error: 'Bad Request',
        });
      },
    }),
  )
  async handleReceiver(@Body() dto: CreateUserDto): Promise<AcceptedResponseDto> {
    const user = await this.receiverService.create(dto);
    return {
      id: user.id,
      statusCode: 202,
      message: 'Request has been accepted for processing.',
    };
  }
}
