import { Quiz, ExamSession, ExamResult, User, Question } from '@/types/exam';

// Local Storage Keys
const QUIZZES_KEY = 'exam_system_quizzes';
const SESSIONS_KEY = 'exam_system_sessions';
const RESULTS_KEY = 'exam_system_results';
const CURRENT_USER_KEY = 'exam_system_current_user';
const USERS_KEY = 'exam_system_users';

// Quiz Management
export const saveQuiz = (quiz: Quiz): void => {
  const quizzes = getQuizzes();
  const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
  
  if (existingIndex !== -1) {
    quizzes[existingIndex] = quiz;
  } else {
    quizzes.push(quiz);
  }
  
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
};

export const getQuizzes = (): Quiz[] => {
  const stored = localStorage.getItem(QUIZZES_KEY);
  return stored ? JSON.parse(stored) : getDefaultQuizzes();
};

export const getQuizById = (id: string): Quiz | null => {
  const quizzes = getQuizzes();
  return quizzes.find(q => q.id === id) || null;
};

export const deleteQuiz = (id: string): void => {
  const quizzes = getQuizzes().filter(q => q.id !== id);
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
};

// Session Management
export const saveSession = (session: ExamSession): void => {
  localStorage.setItem(`${SESSIONS_KEY}_${session.quizId}_${session.userId}`, JSON.stringify(session));
};

export const getSession = (quizId: string, userId: string): ExamSession | null => {
  const stored = localStorage.getItem(`${SESSIONS_KEY}_${quizId}_${userId}`);
  return stored ? JSON.parse(stored) : null;
};

export const clearSession = (quizId: string, userId: string): void => {
  localStorage.removeItem(`${SESSIONS_KEY}_${quizId}_${userId}`);
};

// Results Management
export const saveResult = (result: ExamResult): void => {
  const results = getResults();
  results.push(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
};

export const getResults = (): ExamResult[] => {
  const stored = localStorage.getItem(RESULTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getUserResults = (userId: string): ExamResult[] => {
  return getResults().filter(result => result.userId === userId);
};

// User Management
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex !== -1) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Check if user has already attempted a quiz
export const hasAttemptedQuiz = (quizId: string, userId: string): boolean => {
  const results = getResults();
  return results.some(result => result.quizId === quizId && result.userId === userId);
};

// Default sample quiz data
const getDefaultQuizzes = (): Quiz[] => [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        id: '1',
        question: 'Which of the following is NOT a JavaScript data type?',
        options: ['String', 'Boolean', 'Float', 'Number'],
        correctAnswer: 2,
        explanation: 'JavaScript has Number type for all numeric values, not separate Float type.'
      },
      {
        id: '2', 
        question: 'What does "=== " operator do in JavaScript?',
        options: ['Assignment', 'Equality check', 'Strict equality check', 'Not equal'],
        correctAnswer: 2,
        explanation: 'The === operator checks both value and type without type coercion.'
      },
      {
        id: '3',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
        explanation: 'push() adds one or more elements to the end of an array.'
      }
    ]
  }
];