import { useState, useEffect } from 'react';
import { Quiz, User, ExamSession, ExamResult, UserAnswer } from '@/types/exam';
import { LoginForm } from '@/components/LoginForm';
import { QuizSelection } from '@/components/QuizSelection';
import { ExamInterface } from '@/components/ExamInterface';
import { ExamResults } from '@/components/ExamResults';
import { AdminPanel } from '@/components/AdminPanel';
import { 
  getCurrentUser, 
  setCurrentUser, 
  logout, 
  getQuizzes, 
  getQuizById,
  saveResult,
  getUserResults,
  clearSession 
} from '@/utils/storage';

type AppState = 
  | 'login'
  | 'quiz-selection'
  | 'exam'
  | 'results'
  | 'admin'
  | 'view-results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [userResults, setUserResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    // Check for existing user session
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      setAppState('quiz-selection');
    }
    
    // Load quizzes
    setQuizzes(getQuizzes());
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
    setAppState('quiz-selection');
  };

  const handleLogout = () => {
    logout();
    setCurrentUserState(null);
    setAppState('login');
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setAppState('exam');
  };

  const handleExamComplete = (answers: UserAnswer[]) => {
    if (!currentQuiz || !currentUser) return;

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = currentQuiz.questions.length;
    
    currentQuiz.questions.forEach((question) => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      if (userAnswer && userAnswer.selectedOption === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= currentQuiz.passingScore;
    const timeSpent = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);

    const result: ExamResult = {
      id: Date.now().toString(),
      quizId: currentQuiz.id,
      userId: currentUser.id,
      score,
      percentage,
      totalQuestions,
      correctAnswers,
      timeSpent,
      completedAt: new Date(),
      passed,
      answers
    };

    saveResult(result);
    setExamResult(result);
    setAppState('results');
  };

  const handleBackToHome = () => {
    setCurrentQuiz(null);
    setExamResult(null);
    setAppState('quiz-selection');
    // Refresh quizzes in case they were updated
    setQuizzes(getQuizzes());
  };

  const handleRetakeQuiz = () => {
    if (currentQuiz && currentUser) {
      // Clear any existing session
      clearSession(currentQuiz.id, currentUser.id);
      setAppState('exam');
    }
  };

  const handleViewResults = (results: ExamResult[]) => {
    setUserResults(results);
    setAppState('view-results');
  };

  const handleAdminPanel = () => {
    setAppState('admin');
  };

  const handleQuizzesUpdate = () => {
    setQuizzes(getQuizzes());
  };

  const renderCurrentState = () => {
    switch (appState) {
      case 'login':
        return <LoginForm onLogin={handleLogin} />;

      case 'quiz-selection':
        return (
          <QuizSelection
            quizzes={quizzes}
            user={currentUser!}
            onSelectQuiz={handleSelectQuiz}
            onViewResults={handleViewResults}
            onAdminPanel={handleAdminPanel}
            onLogout={handleLogout}
          />
        );

      case 'exam':
        return (
          <ExamInterface
            quiz={currentQuiz!}
            user={currentUser!}
            onComplete={handleExamComplete}
            onExit={handleBackToHome}
          />
        );

      case 'results':
        return (
          <ExamResults
            result={examResult!}
            quiz={currentQuiz!}
            onRetakeQuiz={handleRetakeQuiz}
            onBackToHome={handleBackToHome}
          />
        );

      case 'admin':
        return (
          <AdminPanel
            quizzes={quizzes}
            onBack={handleBackToHome}
            onQuizzesUpdate={handleQuizzesUpdate}
          />
        );

      case 'view-results':
        return (
          <div className="min-h-screen bg-gradient-subtle">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={handleBackToHome}
                  className="text-primary hover:underline"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold">My Results</h1>
              </div>
              
              {userResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No results found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userResults.map((result) => {
                    const quiz = getQuizById(result.quizId);
                    
                    return (
                      <div 
                        key={result.id} 
                        className="bg-card rounded-lg p-6 shadow-card border"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-semibold">{quiz?.title}</h3>
                            <p className="text-muted-foreground">
                              Completed on {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${
                              result.passed ? 'text-accent' : 'text-destructive'
                            }`}>
                              {result.percentage}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.score}/{result.totalQuestions} correct
                            </div>
                            <div className={`text-sm font-medium ${
                              result.passed ? 'text-accent' : 'text-destructive'
                            }`}>
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <LoginForm onLogin={handleLogin} />;
    }
  };

  return renderCurrentState();
};

export default Index;