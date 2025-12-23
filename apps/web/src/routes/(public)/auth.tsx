import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Briefcase, Lock, Mail, User, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/router';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/(public)/auth')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { refetch, data: session } = authClient.useSession();
  console.log('session', session);
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const handleSignUp = async () => {
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    authClient.signUp.email(
      {
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
      },
      {
        onError(error) {
          toast.error(error.error?.message || 'Sign up failed');
          setIsLoading(false);
        },
        onSuccess() {
          queryClient.refetchQueries();
          toast.success("You're signed up successfully!");
          refetch();
          setIsLoading(false);
          navigate({ to: '/jobs' });
        },
        onFinished() {
          setIsLoading(false);
        },
      },
    );
  };

  const handleSignIn = async () => {
    if (!signInData.email || !signInData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    authClient.signIn.email(
      {
        email: signInData.email,
        password: signInData.password,
      },
      {
        onError(error) {
          toast.error(error.error?.message || 'Sign in failed');
          setIsLoading(false);
        },
        onSuccess() {
          toast.success("You're signed in successfully!");
          refetch();
          setIsLoading(false);
          navigate({ to: '/dashboard' });
        },
        onFinished() {
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4'>
      <div className='w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center'>
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='hidden lg:flex flex-col gap-6 p-8'
        >
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
                <Briefcase className='h-6 w-6 text-primary' />
              </div>
              <Link to='/'>
                <h1 className='text-4xl font-bold tracking-tight'>OnWork</h1>
              </Link>
            </div>
            <p className='text-xl text-muted-foreground'>
              Decentralized Freelance Platform
            </p>
          </div>

          <div className='space-y-6 mt-8'>
            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Wallet className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold mb-1'>Secure Escrow</h3>
                <p className='text-sm text-muted-foreground'>
                  Smart contract-based escrow ensures safe payments for both
                  clients and freelancers
                </p>
              </div>
            </div>
            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Lock className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold mb-1'>Trustless Transactions</h3>
                <p className='text-sm text-muted-foreground'>
                  No intermediaries needed. Work directly with clients on the
                  blockchain
                </p>
              </div>
            </div>
            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Briefcase className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold mb-1'>Milestone-Based Payments</h3>
                <p className='text-sm text-muted-foreground'>
                  Get paid as you complete milestones with transparent tracking
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='w-full'
        >
          <Card className='border-2 shadow-xl'>
            <CardHeader className='space-y-1 pb-6'>
              <CardTitle className='text-2xl font-bold text-center'>
                Welcome to OnWork
              </CardTitle>
              <CardDescription className='text-center'>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='signin' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 mb-6'>
                  <TabsTrigger value='signin'>Sign In</TabsTrigger>
                  <TabsTrigger value='signup'>Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value='signin' className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='signin-email'>Email</Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='signin-email'
                        type='email'
                        placeholder='you@example.com'
                        className='pl-10'
                        value={signInData.email}
                        onChange={(e) =>
                          setSignInData({
                            ...signInData,
                            email: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='signin-password'>Password</Label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='signin-password'
                        type='password'
                        placeholder='••••••••'
                        className='pl-10'
                        value={signInData.password}
                        onChange={(e) =>
                          setSignInData({
                            ...signInData,
                            password: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSignIn}
                    className='w-full mt-6'
                    size='lg'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value='signup' className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='signup-name'>Full Name</Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='signup-name'
                        type='text'
                        placeholder='John Doe'
                        className='pl-10'
                        value={signUpData.name}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='signup-email'>Email</Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='signup-email'
                        type='email'
                        placeholder='you@example.com'
                        className='pl-10'
                        value={signUpData.email}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='signup-password'>Password</Label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='signup-password'
                        type='password'
                        placeholder='••••••••'
                        className='pl-10'
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            password: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSignUp}
                    className='w-full mt-6'
                    size='lg'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Mobile Branding */}
          <div className='lg:hidden mt-8 text-center space-y-2'>
            <p className='text-sm text-muted-foreground'>
              Powered by blockchain technology
            </p>
            <p className='text-xs text-muted-foreground'>
              Secure • Transparent • Decentralized
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
