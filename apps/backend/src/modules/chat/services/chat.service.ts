import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatMessage } from "../domain/entities/chat-message.entity";
import { SubscriptionsService } from "src/modules/subscriptions/services/subscriptions.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepository: Repository<ChatMessage>,

    private readonly subscriptionsService: SubscriptionsService
  ) {}

  async askQuestion(userId: string, question: string) {
    await this.subscriptionsService.consumeQouta(userId);

    const { answer, tokensUsed } = await this.simulateOpenAIResponse(question);

    const newMessage = this.chatRepository.create({
      userId,
      question,
      answer,
      tokensUsed,
    });

    await this.chatRepository.save(newMessage);

    return this.chatRepository.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });
  }

  async chatHistory(userId: string) {
    return this.chatRepository.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });
  }

  private async simulateOpenAIResponse(question: string) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return { answer: "Mocked response from AI", tokensUsed: Math.floor(Math.random() * 50) + 10 };
  }
}
