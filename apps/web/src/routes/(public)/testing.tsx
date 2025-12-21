import { JobList } from '@/components/testing';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/testing')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <JobList />
    </div>
  );
}
