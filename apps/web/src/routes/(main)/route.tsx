import { Header } from '@/components/header';
import { authClient } from '@/lib/auth-client';
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/(main)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return (
      <Link
        to='/auth'
        className='flex h-[50vh] flex-col items-center justify-center gap-4'
      >
        <h2 className='text-2xl font-bold text-muted-foreground'>
          Welcome to OnWork
        </h2>
        <p className='text-xl text-muted-foreground'>
          Please sign in to continue
        </p>
      </Link>
    );
  }

  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}
