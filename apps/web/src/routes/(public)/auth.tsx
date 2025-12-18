import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/router';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/(public)/auth')({
  component: RouteComponent,
});

function RouteComponent() {
  const { refetch } = authClient.useSession();
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSignUp = () => {
    authClient.signUp.email(
      {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      },
      {
        onError(error) {},
        onSuccess() {
          queryClient.refetchQueries();
          toast.success("You're signed up successfully!");
          refetch();
        },
        onFinished() {},
      },
    );
  };

  const handleSignIn = () => {
    authClient.signIn.email(
      {
        email: credentials.email,
        password: credentials.password,
      },
      {
        onError(error) {},
        onSuccess() {
          queryClient.refetchQueries();
          toast.success("You're signed in successfully!");
          refetch();
        },
        onFinished() {},
      },
    );
  };

  return (
    <div className='flex items-center flex-col gap-5 justify-center h-screen container mx-auto'>
      <Card className='w-full'>
        <CardContent className='flex w-full flex-col gap-4'>
          <Input
            placeholder='name'
            onChange={(e) =>
              setCredentials({ ...credentials, name: e.target.value })
            }
          />
          <Input
            placeholder='email'
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
          />
          <Input
            placeholder='password'
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
          <Button onClick={handleSignUp}>Sign up</Button>
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardContent className='flex w-full flex-col gap-4'>
          <Input
            placeholder='email'
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
          />
          <Input
            placeholder='password'
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
          <Button onClick={handleSignIn}>Sign in</Button>
        </CardContent>
      </Card>
    </div>
  );
}
