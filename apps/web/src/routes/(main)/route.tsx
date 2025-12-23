import { Header } from '@/components/header';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(main)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  console.log('session', session);

  if (!session?.user)
    return (
      <Link to='/auth'>
        <h1>Login</h1>
      </Link>
    );

  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}
