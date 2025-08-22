import { ExamResult, Quiz } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './QuestionCard';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, Home } from 'lucide-react';
import { useState } from 'react';

interface ExamResultsProps {
  result: ExamResult;
  quiz: Quiz;
  onRetakeQuiz?: () => void;
  onBackToHome: () => void;
}

export const ExamResults = ({ result, quiz, onRetakeQuiz, onBackToHome }: ExamResultsProps) => {
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = () => {
    if (result.percentage >= 80) return 'text-accent';
    if (result.percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = () => {
    if (result.percentage >= 80) return 'bg-accent';
    if (result.percentage >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  if (showDetailedReview) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailedReview(false)}
              className="mb-4"
            >
              ← Back to Results
            </Button>
            <h1 className="text-3xl font-bold">Detailed Review</h1>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>

          <div className="space-y-8">
            {quiz.questions.map((question, index) => {
              const userAnswer = result.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.selectedOption === question.correctAnswer;
              
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  totalQuestions={quiz.questions.length}
                  selectedAnswer={userAnswer?.selectedOption}
                  onAnswerSelect={() => {}}
                  showExplanation={true}
                  isCorrect={isCorrect}
                />
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button onClick={() => setShowDetailedReview(false)}>
              Back to Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader className="text-center bg-gradient-subtle">
          <div className={`w-20 h-20 mx-auto rounded-full ${getScoreBg()} text-white flex items-center justify-center mb-4`}>
            {result.passed ? (
              <Trophy className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {result.passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </CardTitle>
          <p className="text-muted-foreground text-lg">{quiz.title}</p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
              {result.percentage}%
            </div>
            <p className="text-xl text-muted-foreground">
              Your Score: {result.score} / {result.totalQuestions}
            </p>
            <p className={`text-lg font-medium mt-2 ${
              result.passed ? 'text-accent' : 'text-destructive'
            }`}>
              {result.passed ? 'PASSED' : 'FAILED'} (Required: {quiz.passingScore}%)
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-4 bg-muted rounded-lg">
              <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{result.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatTime(result.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Accuracy Rate:</span>
                <span className={`font-medium ${getScoreColor()}`}>
                  {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Time per Question:</span>
                <span className="font-medium">
                  {formatTime(Math.round(result.timeSpent / result.totalQuestions))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completion Date:</span>
                <span className="font-medium">
                  {new Date(result.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4">
            <Button 
              onClick={() => setShowDetailedReview(true)}
              variant="outline"
              className="w-full"
            >
              Review Answers & Explanations
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              {onRetakeQuiz && (
                <Button 
                  onClick={onRetakeQuiz}
                  variant="secondary"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </Button>
              )}
              
              <Button 
                onClick={onBackToHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};