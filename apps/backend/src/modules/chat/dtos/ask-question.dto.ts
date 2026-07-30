import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskQuestionDto {
    @IsString()
    @IsNotEmpty({ message: 'Question is required' })
    @MaxLength(2000, { message: 'Question must be under 2000 characters' })
    question: string;
}