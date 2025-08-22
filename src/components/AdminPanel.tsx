import { useState } from 'react';
import { Quiz, Question, ExamResult, User } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X, BarChart3, Users, ArrowLeft } from 'lucide-react';
import { saveQuiz, deleteQuiz, getResults, getUsers, getUserResults } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  quizzes: Quiz[];
  onBack: () => void;
  onQuizzesUpdate: () => void;
}

export const AdminPanel = ({ quizzes, onBack, onQuizzesUpdate }: AdminPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quizzes');
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const allResults = getResults();
  const allUsers = getUsers();

  // Quiz form state
  const [quizForm, setQuizForm] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questions: []
  });

  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const handleCreateQuiz = () => {
    setIsCreating(true);
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      timeLimit: 30,
      passingScore: 70,
      questions: []
    });
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsCreating(false);
    setQuizForm(quiz);
  };

  const handleSaveQuiz = () => {
    if (!quizForm.title || !quizForm.description || !quizForm.questions || quizForm.questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one question.",
        variant: "destructive",
      });
      return;
    }

    const quiz: Quiz = {
      id: editingQuiz?.id || Date.now().toString(),
      title: quizForm.title!,
      description: quizForm.description!,
      timeLimit: quizForm.timeLimit!,
      passingScore: quizForm.passingScore!,
      questions: quizForm.questions!
    };

    saveQuiz(quiz);
    setEditingQuiz(null);
    setIsCreating(false);
    onQuizzesUpdate();
    
    toast({
      title: "Success",
      description: `Quiz ${editingQuiz ? 'updated' : 'created'} successfully.`,
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      deleteQuiz(quizId);
      onQuizzesUpdate();
      toast({
        title: "Success",
        description: "Quiz deleted successfully.",
      });
    }
  };

  const handleAddQuestion = () => {
    if (!questionForm.question || questionForm.options?.some(opt => !opt.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in the question and all options.",
        variant: "destructive",
      });
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      question: questionForm.question!,
      options: questionForm.options!,
      correctAnswer: questionForm.correctAnswer!,
      explanation: questionForm.explanation || undefined
    };

    setQuizForm(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));

    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });

    toast({
      title: "Success",
      description: "Question added successfully.",
    });
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId) || []
    }));
  };

  const getQuizStats = (quizId: string) => {
    const quizResults = allResults.filter(result => result.quizId === quizId);
    const totalAttempts = quizResults.length;
    const passedAttempts = quizResults.filter(result => result.passed).length;
    const averageScore = totalAttempts > 0 
      ? Math.round(quizResults.reduce((sum, result) => sum + result.percentage, 0) / totalAttempts)
      : 0;

    return { totalAttempts, passedAttempts, averageScore };
  };

  if (isCreating || editingQuiz) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setEditingQuiz(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Button>
            <h1 className="text-3xl font-bold">
              {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                    min="1"
                    max="180"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  min="0"
                  max="100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card className="shadow-card mt-8">
            <CardHeader>
              <CardTitle>Questions ({quizForm.questions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Question Form */}
              <div className="border-2 border-dashed border-muted rounded-lg p-6">
                <h3 className="font-semibold mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questionForm.options?.map((option, index) => (
                      <div key={index}>
                        <Label htmlFor={`option-${index}`}>
                          Option {String.fromCharCode(65 + index)}
                          {questionForm.correctAnswer === index && (
                            <Badge variant="default" className="ml-2">Correct</Badge>
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`option-${index}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(questionForm.options || [])];
                              newOptions[index] = e.target.value;
                              setQuestionForm(prev => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                          />
                          <Button
                            variant={questionForm.correctAnswer === index ? "default" : "outline"}
                            onClick={() => setQuestionForm(prev => ({ ...prev, correctAnswer: index }))}
                          >
                            ✓
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                      placeholder="Explain why this is the correct answer"
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleAddQuestion} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              {quizForm.questions && quizForm.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Questions</h3>
                  {quizForm.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm mb-3">{question.question}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded ${
                              optIndex === question.correctAnswer 
                                ? 'bg-accent text-accent-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t">
                <Button onClick={handleSaveQuiz} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Quiz
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingQuiz(null);
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="quizzes">Manage Quizzes</TabsTrigger>
            <TabsTrigger value="results">View Results</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Quiz Management</h2>
              <Button onClick={handleCreateQuiz} className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Quiz
              </Button>
            </div>

            {quizzes.length === 0 ? (
              <Card className="text-center p-12">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">No Quizzes Created</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first quiz.
                  </p>
                  <Button onClick={handleCreateQuiz} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {quizzes.map((quiz) => {
                  const stats = getQuizStats(quiz.id);
                  
                  return (
                    <Card key={quiz.id} className="shadow-card">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{quiz.title}</h3>
                              <Badge>{quiz.questions.length} Questions</Badge>
                              <Badge variant="outline">{quiz.timeLimit}m</Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{quiz.description}</p>
                            
                            <div className="flex gap-6 text-sm">
                              <div>
                                <span className="font-medium">Total Attempts:</span>
                                <span className="ml-2">{stats.totalAttempts}</span>
                              </div>
                              <div>
                                <span className="font-medium">Pass Rate:</span>
                                <span className="ml-2">
                                  {stats.totalAttempts > 0 
                                    ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100)
                                    : 0
                                  }%
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Average Score:</span>
                                <span className="ml-2">{stats.averageScore}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuiz(quiz)}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <h2 className="text-2xl font-semibold">Exam Results</h2>
            
            {allResults.length === 0 ? (
              <Card className="text-center p-12">
                <CardContent>
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Results Available</h3>
                  <p className="text-muted-foreground">
                    Results will appear here when students complete quizzes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allResults.map((result) => {
                  const quiz = quizzes.find(q => q.id === result.quizId);
                  const user = allUsers.find(u => u.id === result.userId);
                  
                  return (
                    <Card key={result.id} className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{quiz?.title || 'Unknown Quiz'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {user?.name || 'Unknown User'} • {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              result.passed ? 'text-accent' : 'text-destructive'
                            }`}>
                              {result.percentage}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.score}/{result.totalQuestions}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-semibold">User Management</h2>
            
            {allUsers.length === 0 ? (
              <Card className="text-center p-12">
                <CardContent>
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Users Registered</h3>
                  <p className="text-muted-foreground">
                    User accounts will appear here when they log in.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {allUsers.map((user) => {
                  const userResultsForUser = getUserResults(user.id);
                  const totalQuizzes = userResultsForUser.length;
                  const passedQuizzes = userResultsForUser.filter(r => r.passed).length;
                  
                  return (
                    <Card key={user.id} className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold">{user.name}</h4>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div>Quizzes Taken: {totalQuizzes}</div>
                            <div>Passed: {passedQuizzes}</div>
                            <div>Success Rate: {totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};