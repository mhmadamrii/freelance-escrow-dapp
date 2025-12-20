import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { shortenAddress } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';
import { useTRPC } from '@/utils/trpc';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

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

  const { data: session } = authClient.useSession();
  const { data: currentUser } = useQuery(
    trpc.user.getCurrentUser.queryOptions(),
  );

  console.log('current user', currentUser);

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

  // Dummy Data
  const activeJobs = [
    {
      id: '1',
      title: 'DeFi Dashboard Frontend',
      client: '0x1234...5678',
      budget: '2.5 ETH',
      status: 'In Progress',
      deadline: '2 days left',
    },
    {
      id: '2',
      title: 'Smart Contract Audit',
      client: '0x8765...4321',
      budget: '1.0 ETH',
      status: 'Funded',
      deadline: '1 week left',
    },
  ];

  const jobHistory = [
    {
      id: '3',
      title: 'NFT Marketplace UI',
      client: '0xabcd...efgh',
      budget: '3.0 ETH',
      status: 'Completed',
      completedAt: '2 weeks ago',
      rating: 5,
    },
    {
      id: '4',
      title: 'Token Vesting Contract',
      client: '0xijkl...mnop',
      budget: '1.5 ETH',
      status: 'Completed',
      completedAt: '1 month ago',
      rating: 4,
    },
  ];

  return (
    <div className='container mx-auto max-w-5xl px-4 py-8 space-y-8'>
      {/* Header Section */}
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
                <Wallet className='h-3 w-3' />{' '}
                {shortenAddress(session?.user?.id || '')}
              </span>
            </div>
          </div>
        </div>
        <div className='flex gap-3'>
          {currentUser?.role !== 'FREELANCER' && (
            <Button onClick={() => applyAsFreelancer()} disabled={isApplying}>
              {isApplying ? 'Applying...' : 'Become a Freelancer'}
            </Button>
          )}
          <Button variant='outline' className='gap-2' onClick={handleLogout}>
            <LogOut className='h-4 w-4' /> Log out
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Earnings
            </CardTitle>
            <Wallet className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12.5 ETH</div>
            <p className='text-xs text-muted-foreground'>
              +2.1 ETH from last month
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
            <div className='text-2xl font-bold'>14</div>
            <p className='text-xs text-muted-foreground'>
              100% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Rating</CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>4.9</div>
            <p className='text-xs text-muted-foreground'>Based on 12 reviews</p>
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
          {activeJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-base'>{job.title}</CardTitle>
                    <CardDescription>Client: {job.client}</CardDescription>
                  </div>
                  <Badge variant='secondary'>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-4 text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Wallet className='h-3 w-3' /> {job.budget}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Briefcase className='h-3 w-3' /> {job.deadline}
                    </span>
                  </div>
                  <Button variant='ghost' size='sm' className='text-primary'>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value='history' className='mt-6 space-y-4'>
          {jobHistory.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-base'>{job.title}</CardTitle>
                    <CardDescription>Client: {job.client}</CardDescription>
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
                    <span className='flex items-center gap-1'>
                      <Wallet className='h-3 w-3' /> {job.budget}
                    </span>
                    <span className='flex items-center gap-1'>
                      <CheckCircle2 className='h-3 w-3' /> {job.completedAt}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-yellow-500'>
                    <Star className='h-3 w-3 fill-current' />
                    <span className='font-medium text-foreground'>
                      {job.rating}.0
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
