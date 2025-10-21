import { Controller, Post, Body } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { ApiOperation } from '@nestjs/swagger';
import { SendEventDto } from './dto/sendEvent';

@Controller('websocket')
export class WebsocketController {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  @Post('send-event')
  @ApiOperation({ summary: 'Send websocket event to user' })
  sendEvent(@Body() body: SendEventDto) {
    this.websocketGateway.sendEventToUser(body.userId, {
      message: body.message,
      event: body.event,
      time: new Date().toISOString(),
    });

    return { ok: true };
  }
}
