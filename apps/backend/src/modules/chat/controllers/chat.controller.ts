import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import type { Request } from 'express';
import { AskQuestionDto } from '../dtos/ask-question.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  async ask(@Req() req: Request, @Body() dto: AskQuestionDto) {
    const userId = (req as any).user.sub;
    return this.chatService.askQuestion(userId, dto.question);
  }

  @Get()
  async history(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.chatService.chatHistory(userId);
  }
}
