import { useState, useEffect, useCallback } from 'react';
import { Quiz, ExamSession, UserAnswer, User } from '@/types/exam';
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react';
import { saveSession, clearSession } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

interface ExamInterfaceProps {
  quiz: Quiz;
  user: User;
  onComplete: (answers: UserAnswer[]) => void;
  onExit: () => void;
}

export const ExamInterface = ({ quiz, user, onComplete, onExit }: ExamInterfaceProps) => {
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60); // Convert to seconds
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Auto-save session periodically
  useEffect(() => {
    const session: ExamSession = {
      quizId: quiz.id,
      userId: user.id,
      startTime,
      answers,
      currentQuestionIndex,
      timeRemaining
    };
    
    saveSession(session);
  }, [quiz.id, user.id, startTime, answers, currentQuestionIndex, timeRemaining]);

  const handleAnswerSelect = useCallback((selectedOption: number) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      timeSpent
    };
    
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  }, [currentQuestionIndex, quiz.questions, questionStartTime]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, quiz.questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    clearSession(quiz.id, user.id);
    onComplete(answers);
  }, [quiz.id, user.id, answers, onComplete]);

  const handleTimeUp = useCallback(() => {
    toast({
      title: "Time's Up!",
      description: "The exam has been automatically submitted.",
      variant: "destructive",
    });
    handleSubmit();
  }, [handleSubmit, toast]);

  // Tab visibility detection for basic cheat prevention
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast({
          title: "Warning",
          description: "Tab switching detected during exam",
          variant: "destructive",
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [toast]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredCount = answers.length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b shadow-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">{quiz.title}</h1>
              <p className="text-muted-foreground">{user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Timer 
                initialTime={timeRemaining}
                onTimeUp={handleTimeUp}
                isActive={true}
              />
              <Button variant="outline" onClick={onExit} className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <ProgressBar current={currentQuestionIndex + 1} total={quiz.questions.length} />
      </div>

      {/* Question */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          selectedAnswer={currentAnswer?.selectedOption}
          onAnswerSelect={handleAnswerSelect}
        />
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-elevated">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Answered: {answeredCount} / {quiz.questions.length}
              </p>
              <div className="flex gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setQuestionStartTime(Date.now());
                    }}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-primary text-primary-foreground'
                        : answers.some(a => a.questionId === quiz.questions[index].id)
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {isLastQuestion ? (
              <Button 
                onClick={handleSubmit}
                className="gap-2 bg-gradient-success"
                disabled={answeredCount === 0}
              >
                <Flag className="w-4 h-4" />
                Submit Exam
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed navigation */}
      <div className="h-24" />
    </div>
  );
};