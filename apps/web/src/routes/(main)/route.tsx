import { authClient } from '@/lib/auth-client';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/(main)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  console.log('user serssion', session);

  useEffect(() => {
    if (!session) {
      redirect({
        to: '/',
      });
    }
  }, [session]);

  return (
    <main>
      <Outlet />
    </main>
  );
}
