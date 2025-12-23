import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatEther } from 'viem';
import { shortenAddress, shortenAmount } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';
import { useTRPC } from '@/utils/trpc';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useEffect } from 'react';
import type { MyJobsOutput } from '@onwork/api/routers/job';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Briefcase,
  CheckCircle2,
  LogOut,
  Star,
  User,
  Wallet,
} from 'lucide-react';

export const Route = createFileRoute('/(main)/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const { data: session } = authClient.useSession();
  const { data: currentUser } = useQuery(
    trpc.user.getCurrentUser.queryOptions(),
  );

  console.log('current user', currentUser);

  const { mutate: linkWallet } = useMutation(
    trpc.user.linkWallet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    }),
  );

  const { mutate: applyAsFreelancer, isPending: isApplying } = useMutation(
    trpc.user.applyAsFreelancer.mutationOptions({
      onSuccess: () => {
        toast.success("You're now a freelancer!");
        queryClient.invalidateQueries();
      },
    }),
  );

  const handleLogout = () => {
    disconnect();
    authClient.signOut();
    window.location.href = '/';
  };

  const { data: myJobs } = useQuery(trpc.job.getMyJobs.queryOptions());

  const activeJobs = useMemo(() => {
    return (
      myJobs?.filter(
        (job) => job.status !== 'COMPLETED' && job.status !== 'CANCELLED',
      ) || []
    );
  }, [myJobs]);

  const jobHistory = useMemo(() => {
    return (
      myJobs?.filter(
        (job) => job.status === 'COMPLETED' || job.status === 'CANCELLED',
      ) || []
    );
  }, [myJobs]);

  const jobsCompleted = useMemo(() => {
    return myJobs?.filter((job) => job.status === 'COMPLETED').length || 0;
  }, [myJobs]);

  const reviews = useMemo(() => {
    return myJobs?.flatMap((job: MyJobsOutput[number]) => job.reviews) || [];
  }, [myJobs]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  useEffect(() => {
    if (currentUser && address && !currentUser.walletAddress) {
      linkWallet({ walletAddress: address });
    }
  }, [currentUser, address, linkWallet]);

  return (
    <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8'>
      <div className='flex flex-col md:flex-row gap-6 items-start md:items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-20 w-20 border-2 border-primary/10'>
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className='text-xl bg-primary/5'>
              {session?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight'>
              {session?.user?.name || 'User'}
            </h1>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <span className='flex items-center gap-1 text-sm'>
                <User className='h-3 w-3' /> {currentUser?.role || 'User'}
              </span>
              <span>•</span>
              <span className='flex items-center gap-1 text-sm font-mono'>
                <Wallet className='h-3 w-3' /> {shortenAddress(address || '')}
              </span>
            </div>
          </div>
        </div>
        <div className='flex gap-3'>
          {currentUser?.role !== 'FREELANCER' && (
            <Button
              onClick={() => applyAsFreelancer({ walletAddress: address })}
              disabled={isApplying}
            >
              {isApplying ? 'Applying...' : 'Become a Freelancer'}
            </Button>
          )}
          <Button variant='outline' className='gap-2' onClick={handleLogout}>
            <LogOut className='h-4 w-4' /> Log out
          </Button>
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Earnings
            </CardTitle>
            <Wallet className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-1 overflow-hidden'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='text-2xl font-bold cursor-help'>
                    {shortenAmount(
                      formatEther(
                        BigInt(currentUser?.totalEarned?.toString() || '0'),
                      ),
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {formatEther(
                    BigInt(currentUser?.totalEarned?.toString() || '0'),
                  )}{' '}
                  ETH
                </TooltipContent>
              </Tooltip>
              <span className='text-sm font-medium text-muted-foreground shrink-0'>
                ETH
              </span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Lifetime earnings as freelancer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Spent</CardTitle>
            <Wallet className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-1 overflow-hidden'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='text-2xl font-bold cursor-help'>
                    {shortenAmount(
                      formatEther(
                        BigInt(currentUser?.totalSpent?.toString() || '0'),
                      ),
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {formatEther(
                    BigInt(currentUser?.totalSpent?.toString() || '0'),
                  )}{' '}
                  ETH
                </TooltipContent>
              </Tooltip>
              <span className='text-sm font-medium text-muted-foreground shrink-0'>
                ETH
              </span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Lifetime spent as client
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Jobs Completed
            </CardTitle>
            <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{jobsCompleted}</div>
            <p className='text-xs text-muted-foreground'>
              {myJobs?.length
                ? Math.round((jobsCompleted / myJobs.length) * 100)
                : 0}
              % completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Rating</CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgRating.toFixed(1)}</div>
            <p className='text-xs text-muted-foreground'>
              Based on {reviews.length} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue='active' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 lg:w-[400px]'>
          <TabsTrigger value='active'>Active Jobs</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>
        <TabsContent value='active' className='mt-6 space-y-4'>
          {activeJobs.length === 0 && (
            <p className='text-center py-12 text-muted-foreground'>
              No active jobs found.
            </p>
          )}
          {activeJobs.map((job: MyJobsOutput[number]) => (
            <Card key={job.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-base'>{job.title}</CardTitle>
                    <CardDescription>
                      Client: {shortenAddress(job.clientWallet)}
                    </CardDescription>
                  </div>
                  <Badge variant='secondary'>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-4 text-muted-foreground'>
                    <span className='flex items-center gap-1 overflow-hidden'>
                      <Wallet className='h-3 w-3 shrink-0' />{' '}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='cursor-help'>
                            {shortenAmount(
                              formatEther(BigInt(job.totalAmount)),
                              8,
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatEther(BigInt(job.totalAmount))} ETH
                        </TooltipContent>
                      </Tooltip>
                      <span className='shrink-0'>ETH</span>
                    </span>
                    <span className='flex items-center gap-1'>
                      <Briefcase className='h-3 w-3' /> {job.milestones.length}{' '}
                      Milestones
                    </span>
                  </div>
                  <Link to={`/jobs/$id`} params={{ id: job.id }}>
                    <Button variant='ghost' size='sm' className='text-primary'>
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value='history' className='mt-6 space-y-4'>
          {jobHistory.length === 0 && (
            <p className='text-center py-12 text-muted-foreground'>
              No job history found.
            </p>
          )}
          {jobHistory.map((job: MyJobsOutput[number]) => {
            const jobReview = job.reviews?.[0];
            return (
              <Card key={job.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-base'>{job.title}</CardTitle>
                      <CardDescription>
                        Client: {shortenAddress(job.clientWallet)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className='bg-green-500/10 text-green-600 border-green-500/20'
                    >
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-4 text-muted-foreground'>
                      <span className='flex items-center gap-1 overflow-hidden'>
                        <Wallet className='h-3 w-3 shrink-0' />{' '}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='cursor-help'>
                              {shortenAmount(
                                formatEther(BigInt(job.totalAmount)),
                                8,
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatEther(BigInt(job.totalAmount))} ETH
                          </TooltipContent>
                        </Tooltip>
                        <span className='shrink-0'>ETH</span>
                      </span>
                      <span className='flex items-center gap-1'>
                        <CheckCircle2 className='h-3 w-3' />{' '}
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {jobReview && (
                      <div className='flex items-center gap-1 text-yellow-500'>
                        <Star className='h-3 w-3 fill-current' />
                        <span className='font-medium text-foreground'>
                          {jobReview.rating}.0
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
