import { useState } from 'react';
import { Question, UserAnswer } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswerSelect: (answer: number) => void;
  showExplanation?: boolean;
  isCorrect?: boolean;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showExplanation = false,
  isCorrect
}: QuestionCardProps) => {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card">
      <CardHeader className="bg-gradient-subtle">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
          {showExplanation && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isCorrect 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-destructive text-destructive-foreground'
            }`}>
              <CheckCircle className="w-4 h-4" />
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="mb-8">
          <h3 className="text-xl font-semibold leading-relaxed">
            {question.question}
          </h3>
        </div>
        
        <div className="grid gap-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={
                showExplanation 
                  ? index === question.correctAnswer 
                    ? "default" 
                    : selectedAnswer === index 
                    ? "destructive" 
                    : "outline"
                  : selectedAnswer === index 
                  ? "default" 
                  : "outline"
              }
              className={`w-full text-left justify-start p-4 h-auto min-h-[60px] transition-all duration-300 ${
                !showExplanation ? 'hover:scale-[1.02] hover:shadow-md' : ''
              } ${
                showExplanation && index === question.correctAnswer 
                  ? 'bg-accent hover:bg-accent' 
                  : ''
              }`}
              onClick={() => !showExplanation && onAnswerSelect(index)}
              disabled={showExplanation}
            >
              <div className="flex items-center gap-4 w-full">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                  selectedAnswer === index || (showExplanation && index === question.correctAnswer)
                    ? 'bg-current text-background' 
                    : 'border-current'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {showExplanation && question.explanation && (
          <div className="mt-8 p-6 bg-muted rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold mb-2 text-primary">Explanation:</h4>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};