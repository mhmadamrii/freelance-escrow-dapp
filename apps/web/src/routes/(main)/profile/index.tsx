import { Button } from '@/components/ui/button';
import { useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/(main)/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const { data: session } = authClient.useSession();

  const { data: currentUser } = useQuery(
    trpc.user.getCurrentUser.queryOptions(),
  );

  const { mutate: applyAsFreelancer, isPending: isApplying } = useMutation(
    trpc.user.applyAsFreelancer.mutationOptions({
      onSuccess: () => {
        toast.success("You're now a freelancer!");
        queryClient.invalidateQueries();
      },
    }),
  );

  console.log('currentUser', currentUser);

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
    <div className='justify-center flex-col container mx-auto items-center flex h-screen'>
      <pre>{JSON.stringify(session?.user, null, 2)}</pre>
      {currentUser?.role == 'FREELANCER' && <h1>You're a freelancer</h1>}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-2 w-full'>
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
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>

      <div className='flex gap-5'>
        <Button onClick={handleSignUp}>Sign up</Button>
        <Button
          onClick={() => {
            disconnect();
            authClient.signOut();
          }}
        >
          Log out
        </Button>
        <Button onClick={() => applyAsFreelancer()} variant='secondary'>
          {isApplying ? 'Applying...' : 'Apply as freelancer'}
        </Button>
      </div>
    </div>
  );
}
