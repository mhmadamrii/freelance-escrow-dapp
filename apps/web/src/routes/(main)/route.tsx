import { Empty } from '@/components/empty';
import { Header } from '@/components/header';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/(main)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  if (!session) return <Empty />;

  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}
