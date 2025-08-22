export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  questions: Question[];
  passingScore: number; // percentage
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number;
  timeSpent: number; // in seconds
}

export interface ExamSession {
  quizId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  answers: UserAnswer[];
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
}

export interface ExamResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  passed: boolean;
  answers: UserAnswer[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}