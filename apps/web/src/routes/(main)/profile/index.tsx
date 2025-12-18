import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/router';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/(main)/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  console.log('session', session);

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
        },
        onFinished() {},
      },
    );
  };

  return (
    <div className='justify-center items-center flex h-screen'>
      <div className='flex flex-col gap-2 max-w-4xl'>
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
      </div>
      <Button onClick={handleSignUp}>Sign up</Button>
    </div>
  );
}
