import abi from '@/lib/abi.json';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Calendar, Clock, FileUser, User2, Wallet } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { JobApplication } from './-components/job-application';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const Route = createFileRoute('/(main)/jobs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: allJobs } = useQuery(trpc.job.allJobs.queryOptions());
  console.log('allJobs', allJobs);

  const { data: nextJobId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'nextJobId',
  });

  const { data: user } = useQuery(trpc.user.getCurrentUser.queryOptions());

  const { mutate: deleteJob, isPending: isDeletingJob } = useMutation(
    trpc.job.deleteJob.mutationOptions({
      onSuccess: () => {
        toast.success('Job deleted successfully!');
        queryClient.invalidateQueries();
      },
    }),
  );

  return (
    <div className='min-h-screen py-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold mb-8'>Open Jobs</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {allJobs?.map((job) => (
            <div
              key={job.id}
              className='bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col gap-4'
            >
              <div>
                <h2 className='text-xl font-semibold mb-3'>{job.title}</h2>
                <p className='text-muted-foreground text-sm mb-6 line-clamp-3'>
                  {job.description}
                </p>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <Wallet className='w-4 h-4' />
                  <span className='font-medium'>
                    {formatEther(BigInt(job.totalAmount))} ETH
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='w-4 h-4' />
                    <span>1 Month</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='w-4 h-4' />
                    <span>{job.milestones.length} milestones</span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Calendar className='w-4 h-4' />
                  <span>
                    Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <FileUser className='w-4 h-4' />
                  <span>{job.jobApplications.length} Applications</span>
                </div>
              </div>
              <Separator />
              <div className='flex gap-4'>
                <Avatar className='h-20 w-20 border-2 border-primary/10'>
                  <AvatarImage src={job?.user?.image || ''} />
                  <AvatarFallback className='text-xl bg-primary/5'>
                    {job.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1>{job.user?.name}</h1>
                  <h1>{job.user.totalSpent}</h1>
                </div>
              </div>
              <Button
                className='cursor-pointer w-full'
                onClick={() =>
                  navigate({ to: '/jobs/$id', params: { id: job.id } })
                }
              >
                View Details
              </Button>
              {user?.role === 'FREELANCER' && (
                <JobApplication
                  clientWallet={job.clientWallet}
                  jobDesc={job.description}
                  jobId={job.id}
                />
              )}
              <Button
                variant='destructive'
                disabled={isDeletingJob}
                onClick={() =>
                  deleteJob({
                    jobId: job.id,
                  })
                }
              >
                {isDeletingJob ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
