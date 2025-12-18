import { authClient } from '@/lib/auth-client';
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';

export const Route = createFileRoute('/(main)')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    console.log('session', session);
    if (!session) {
      throw redirect({
        to: '/',
      });
    }
  },
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  if (!session) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <h1>Please sign in</h1>
        <Link to='/auth'>Sign in</Link>
      </div>
    );
  }

  return (
    <main className='border border-red-500'>
      <Outlet />
    </main>
  );
}
