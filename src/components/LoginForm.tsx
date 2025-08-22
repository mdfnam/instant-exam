import { useState } from 'react';
import { User } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, UserCog } from 'lucide-react';
import { saveUser } from '@/utils/storage';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('student');

  const handleLogin = (role: 'student' | 'admin') => {
    if (!name.trim() || !email.trim()) return;

    const user: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      role
    };

    saveUser(user);
    onLogin(user);
  };

  // Quick demo login buttons
  const handleDemoLogin = (demoUser: { name: string; email: string; role: 'student' | 'admin' }) => {
    const user: User = {
      id: Date.now().toString(),
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role
    };

    saveUser(user);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center bg-gradient-primary text-primary-foreground">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <GraduationCap className="w-8 h-8" />
            ExamPro
          </CardTitle>
          <p className="opacity-90">Online Examination System</p>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <UserCog className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student-name">Full Name</Label>
                  <Input
                    id="student-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <Button 
                  onClick={() => handleLogin('student')} 
                  className="w-full"
                  disabled={!name.trim() || !email.trim()}
                >
                  Login as Student
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground text-center mb-3">Quick Demo Login:</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin({ name: 'Demo Student', email: 'student@demo.com', role: 'student' })}
                  className="w-full"
                >
                  Demo Student Account
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-name">Full Name</Label>
                  <Input
                    id="admin-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <Button 
                  onClick={() => handleLogin('admin')} 
                  className="w-full"
                  disabled={!name.trim() || !email.trim()}
                >
                  Login as Admin
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground text-center mb-3">Quick Demo Login:</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin({ name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' })}
                  className="w-full"
                >
                  Demo Admin Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              This is a demo system. All data is stored locally in your browser.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};