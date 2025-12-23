import { createFileRoute, Link } from '@tanstack/react-router';
import { formatEther } from 'viem';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JobDetailSheet } from './-components/job-detail-sheet';
import { StatusBadge } from './-components/status-badge';

import {
  Clock,
  FileUser,
  Trash2,
  Wallet,
  ArrowRight,
  Users,
  Bitcoin,
} from 'lucide-react';

export const Route = createFileRoute('/(main)/jobs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: allJobs } = useQuery(trpc.job.allJobs.queryOptions());
  const { data: user } = useQuery(trpc.user.getCurrentUser.queryOptions());

  console.log('all jobs', allJobs);

  const { mutate: deleteJob, isPending: isDeletingJob } = useMutation(
    trpc.job.deleteJob.mutationOptions({
      onSuccess: () => {
        toast.success('Job deleted successfully!');
        queryClient.invalidateQueries();
      },
    }),
  );

  return (
    <div className='min-h-screen bg-linear-to-b from-background to-muted/20'>
      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Available Opportunities
            </h1>
            <p className='text-muted-foreground text-lg max-w-2xl'>
              Discover and apply for the best blockchain projects. Secure
              payments, transparent milestones, and verified clients. Have fancy
              idea? click{' '}
              <Link
                className='italic text-primary hover:underline'
                to='/jobs/create'
              >
                here
              </Link>{' '}
              to create your own job.
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {allJobs?.map((job) => (
            <JobDetailSheet
              key={job.id}
              jobId={job.id}
              userRole={user?.role}
              trigger={
                <div className='group relative bg-card border rounded-2xl p-6 hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col gap-5 overflow-hidden cursor-pointer'>
                  <div className='absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity'>
                    {job.category == 'DEFI' ? (
                      <Bitcoin className='h-24 w-24 -rotate-20' />
                    ) : (
                      <Wallet className='h-24 w-24 -rotate-12' />
                    )}
                  </div>
                  <div className='flex justify-between items-start relative z-10'>
                    <StatusBadge status={job.status} />
                    {user?.role === 'CLIENT' && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                        disabled={isDeletingJob}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteJob({ jobId: job.id });
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                  <div className='relative z-10'>
                    <h2 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1'>
                      {job.title}
                    </h2>
                    <p className='text-muted-foreground text-sm line-clamp-2 leading-relaxed'>
                      {job.description}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-4 relative z-10'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 rounded-lg px-3 py-2'>
                      <Wallet className='w-4 h-4' />
                      <span>{formatEther(BigInt(job.totalAmount))} ETH</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-lg px-3 py-2'>
                      <Clock className='w-4 h-4' />
                      <span>{job.milestones.length} Milestones</span>
                    </div>
                  </div>
                  <Separator className='opacity-50' />
                  <div className='flex items-center justify-between relative z-10'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10 border-2 border-background shadow-sm'>
                        <AvatarImage src={job?.user?.image || ''} />
                        <AvatarFallback className='bg-primary/5 text-primary text-xs font-bold'>
                          {job.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='text-sm font-bold truncate max-w-[100px]'>
                          {job.user?.name || 'Client'}
                        </span>
                        <span className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium'>
                          Posted {format(new Date(job.createdAt), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                      <FileUser className='w-3.5 h-3.5' />
                      <span>{job.jobApplications.length} apps</span>
                    </div>
                  </div>
                </div>
              }
            />
          ))}
        </div>
        {allJobs?.length === 0 && (
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <div className='h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6'>
              <Clock className='h-10 w-10 text-muted-foreground' />
            </div>
            <h3 className='text-2xl font-bold mb-2'>No jobs found</h3>
            <p className='text-muted-foreground max-w-sm'>
              There are currently no open jobs. Check back later or post a new
              job if you are a client.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
