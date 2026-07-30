import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../../user/domain/entities/user.entity";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column("text")
  question: string;

  @Column("text")
  answer: string;

  @Column()
  tokensUsed: number;

  @CreateDateColumn()
  createdAt: Date;
}
