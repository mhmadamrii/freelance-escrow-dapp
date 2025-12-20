import abi from '@/lib/abi.json';
import { JobMilestones } from '../-components/job-milestones';
import { shortenAddress } from '@/lib/utils';
import { StatusBadge } from '../-components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { formatEther, parseEther } from 'viem';
import { AssignFreelancer } from '../-components/assign-freelancer';
import { Separator } from '@/components/ui/separator';
import { useTRPC } from '@/utils/trpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Globe,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react';

export const Route = createFileRoute('/(main)/jobs/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { id } = Route.useParams();
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { data: job } = useQuery(
    trpc.job?.jobById.queryOptions({
      jobId: id,
    }),
  );

  console.log('job', job);

  const { mutate } = useMutation(
    trpc.job.updateJobStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Job funded successfully!');
      },
      onError: (err) => {
        console.log('error', err);
        toast.error('Error assigning freelancer');
      },
    }),
  );

  const {
    isLoading: isFundingJob,
    isSuccess: isSuccessFundingJob,
    isError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleFundJob = () => {
    try {
      if (job?.jobApplications.length == 0) {
        return toast.error('No applications found');
      }

      writeContract({
        address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
        abi: abi,
        functionName: 'fundJob',
        args: [BigInt(job?.onChainId?.toString() ?? '0')],
        value: parseEther(job?.totalAmount as string),
      });
    } catch (error) {
      console.error('Error funding job:', error);
      toast.error('Failed to fund job?. Please try again.');
    }
  };

  const isClient = job?.clientWallet.toLowerCase() === address?.toLowerCase();
  const isFreelancer = job?.freelancerWallet?.toLowerCase() === address?.toLowerCase(); // prettier-ignore

  const hasApplied = (job?.jobApplications || []).some(
    (app) => app.freelancerWallet.toLowerCase() === address?.toLowerCase(),
  );

  useEffect(() => {
    if (isSuccessFundingJob) {
      mutate({
        jobId: job?.id as string,
        status: 'FUNDED',
      });
    }

    if (isError) {
      toast.error('Failed to fund job?. Transaction was rejected or failed.');
    }
  }, [isSuccessFundingJob, isError]);

  return (
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      {!job && (
        <div className='flex h-[50vh] flex-col items-center justify-center gap-4'>
          <h2 className='text-2xl font-bold text-muted-foreground'>
            Job not found
          </h2>
          <Button variant='outline' onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='grid gap-8 lg:grid-cols-3'
      >
        <div className='lg:col-span-2 space-y-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Briefcase className='h-4 w-4' />
              <span>Jobs</span>
              <span>/</span>
              <span className='truncate max-w-50'>{job?.id}</span>
            </div>
            <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
              {job?.title}
            </h1>
            <div className='flex flex-wrap items-center gap-4'>
              <StatusBadge status={job?.status as string} />
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>Posted {formatDistanceToNow(new Date())} ago</span>
              </div>
              {job?.tokenAddress ? (
                <Badge variant='outline' className='gap-1'>
                  <Coins className='h-3 w-3' /> Token Payment
                </Badge>
              ) : (
                <Badge variant='outline' className='gap-1'>
                  <Globe className='h-3 w-3' /> ETH Payment
                </Badge>
              )}
            </div>
          </div>
          <Separator />
          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight flex items-center gap-2'>
              <FileText className='h-5 w-5' /> Description
            </h2>
            <div className='prose prose-neutral dark:prose-invert max-w-none'>
              <p className='whitespace-pre-wrap leading-relaxed text-lg text-muted-foreground'>
                {job?.description}
              </p>
            </div>
          </section>
          <section className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-semibold tracking-tight flex items-center gap-2'>
                <CheckCircle2 className='h-5 w-5' /> Milestones
              </h2>
              <Link
                className='hover:underline'
                to={`/jobs/$id/milestones`}
                params={{
                  id: job?.id as string,
                }}
              >
                All Milestones
              </Link>
            </div>
            <div className='space-y-4'>
              <JobMilestones job={job} />
            </div>
          </section>
          {isClient && (job?.jobApplications || []).length > 0 && (
            <section className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-semibold tracking-tight flex items-center gap-2'>
                  <User className='h-5 w-5' /> Applications
                </h2>
                <Badge variant='secondary'>
                  {(job?.jobApplications || []).length} Applicants
                </Badge>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                {(job?.jobApplications || []).map((app) => (
                  <Card
                    key={app.id}
                    className='group hover:shadow-md transition-all'
                  >
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base font-medium flex items-center justify-between'>
                        <span className='truncate'>
                          {shortenAddress(app.freelancerWallet)}
                        </span>
                        <Badge
                          variant={
                            app.status === 'ACCEPTED' ? 'default' : 'outline'
                          }
                        >
                          {app.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        Applied {formatDistanceToNow(new Date(app.createdAt))}{' '}
                        ago
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='pb-3'>
                      <p className='text-sm text-muted-foreground line-clamp-3'>
                        {app.coverLetter || 'No cover letter provided.'}
                      </p>
                    </CardContent>
                    <CardFooter>
                      {job?.status === 'CREATED' && (
                        <AssignFreelancer
                          jobId={job?.id}
                          onChainId={job?.onChainId?.toString() ?? '0'}
                          freelancerAddress={app.freelancerWallet}
                          applicationId={app.id}
                          freelancerWallet={app.freelancerWallet}
                        />
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className='space-y-6'>
          <Card className='bg-primary/5 border-primary/20 overflow-hidden relative'>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
              <Wallet className='h-24 w-24' />
            </div>
            <CardHeader>
              <CardDescription>Total Budget</CardDescription>
              <CardTitle className='text-4xl font-bold text-primary'>
                {formatEther(BigInt(job?.totalAmount ?? 0))}{' '}
                <span className='text-lg font-normal text-muted-foreground'>
                  {job?.tokenAddress ? 'TOKEN' : 'ETH'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col gap-3'>
              {isClient ? (
                job?.status === 'CREATED' ||
                job?.status === 'WAITING_FUNDING' ? (
                  <Button
                    disabled={isPending || isFundingJob}
                    onClick={handleFundJob}
                    className='w-full size-lg text-lg font-semibold shadow-lg shadow-primary/20'
                  >
                    Fund Job
                  </Button>
                ) : (
                  <Button className='w-full' variant='outline' disabled>
                    Job Funded
                  </Button>
                )
              ) : isFreelancer ? (
                <Button className='w-full' variant='secondary'>
                  Submit Work
                </Button>
              ) : (
                !hasApplied && (
                  <Button className='w-full size-lg text-lg font-semibold shadow-lg shadow-primary/20'>
                    Apply Now
                  </Button>
                )
              )}
              {hasApplied && !isFreelancer && (
                <Button className='w-full' variant='outline' disabled>
                  Application Sent
                </Button>
              )}
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Job Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center py-2 border-b'>
                <span className='text-sm text-muted-foreground'>Client</span>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500' />
                  <span className='font-mono text-sm'>
                    {shortenAddress(job?.clientWallet ?? '')}
                  </span>
                </div>
              </div>
              <div className='flex justify-between items-center py-2 border-b'>
                <span className='text-sm text-muted-foreground'>Arbiter</span>
                <span className='font-mono text-sm'>
                  {shortenAddress(job?.arbiter ?? '')}
                </span>
              </div>
              <div className='flex justify-between items-center py-2 border-b'>
                <span className='text-sm text-muted-foreground'>Contract</span>
                <div className='flex items-center gap-1 text-primary hover:underline cursor-pointer'>
                  <ShieldCheck className='h-3 w-3' />
                  <span className='text-xs'>View on Explorer</span>
                </div>
              </div>
              <div className='flex justify-between items-center py-2'>
                <span className='text-sm text-muted-foreground'>Created</span>
                <span className='text-sm'>
                  {format(new Date(), 'MMM dd, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
