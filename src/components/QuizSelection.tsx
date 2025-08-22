import { Quiz, User, ExamResult } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Trophy, Users, LogOut, Settings } from 'lucide-react';
import { hasAttemptedQuiz, getUserResults } from '@/utils/storage';

interface QuizSelectionProps {
  quizzes: Quiz[];
  user: User;
  onSelectQuiz: (quiz: Quiz) => void;
  onViewResults: (results: ExamResult[]) => void;
  onAdminPanel: () => void;
  onLogout: () => void;
}

export const QuizSelection = ({ 
  quizzes, 
  user, 
  onSelectQuiz, 
  onViewResults, 
  onAdminPanel, 
  onLogout 
}: QuizSelectionProps) => {
  const userResults = getUserResults(user.id);

  const getDifficultyColor = (passingScore: number): "default" | "destructive" | "outline" | "secondary" => {
    if (passingScore >= 80) return 'destructive';
    if (passingScore >= 60) return 'secondary';
    return 'default';
  };

  const getDifficultyLabel = (passingScore: number) => {
    if (passingScore >= 80) return 'Hard';
    if (passingScore >= 60) return 'Medium';
    return 'Easy';
  };

  const getQuizResult = (quizId: string) => {
    return userResults.find(result => result.quizId === quizId);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b shadow-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Welcome, {user.name}
              </h1>
              <p className="text-muted-foreground">
                {user.role === 'admin' ? 'Administrator Dashboard' : 'Select an exam to begin'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Button variant="outline" onClick={onAdminPanel} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}
              {userResults.length > 0 && (
                <Button variant="outline" onClick={() => onViewResults(userResults)} className="gap-2">
                  <Trophy className="w-4 h-4" />
                  My Results
                </Button>
              )}
              <Button variant="outline" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {quizzes.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Quizzes Available</h2>
              <p className="text-muted-foreground mb-6">
                {user.role === 'admin' 
                  ? 'Create your first quiz to get started.'
                  : 'Please contact your administrator to add quizzes.'
                }
              </p>
              {user.role === 'admin' && (
                <Button onClick={onAdminPanel} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Create Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const attempted = hasAttemptedQuiz(quiz.id, user.id);
              const result = getQuizResult(quiz.id);
              
              return (
                <Card key={quiz.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <Badge variant={getDifficultyColor(quiz.passingScore)}>
                        {getDifficultyLabel(quiz.passingScore)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{quiz.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span>{quiz.questions.length} Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{quiz.timeLimit} Minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span>Pass: {quiz.passingScore}%</span>
                      </div>
                    </div>

                    {result && (
                      <div className="mb-4 p-3 bg-muted rounded-lg border-l-4 border-primary">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Previous Result:</span>
                          <span className={`text-sm font-bold ${
                            result.passed ? 'text-accent' : 'text-destructive'
                          }`}>
                            {result.percentage}% {result.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => onSelectQuiz(quiz)}
                      className="w-full"
                      variant={attempted ? "secondary" : "default"}
                    >
                      {attempted ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>

                    {attempted && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        You have already attempted this quiz
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};