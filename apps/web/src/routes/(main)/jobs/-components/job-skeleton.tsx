import { Skeleton } from '@/components/ui/skeleton';

export function JobSkeleton() {
  return (
    <div className='container mx-auto max-w-6xl px-4 py-8 space-y-8'>
      <div className='space-y-4'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-12 w-3/4' />
        <div className='flex gap-4'>
          <Skeleton className='h-6 w-24' />
          <Skeleton className='h-6 w-32' />
        </div>
      </div>
      <div className='grid gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-8'>
          <Skeleton className='h-40 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
        <div className='space-y-6'>
          <Skeleton className='h-48 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    </div>
  );
}
