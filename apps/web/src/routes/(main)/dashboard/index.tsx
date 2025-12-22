import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import {
  format,
  startOfMonth,
  eachMonthOfInterval,
  subMonths,
  isSameMonth,
} from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Briefcase,
  CheckCircle2,
  Clock,
  Wallet,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const Route = createFileRoute('/(main)/dashboard/')({
  component: RouteComponent,
});

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const chartConfig = {
  amount: {
    label: 'Amount (ETH)',
    color: 'hsl(var(--primary))',
  },
  jobs: {
    label: 'Jobs',
    color: 'hsl(var(--secondary))',
  },
} satisfies ChartConfig;

export function RouteComponent() {
  const trpc = useTRPC();
  const [role, setRole] = useState<'client' | 'freelancer'>('client');

  const { data: currentUser } = useQuery(
    trpc.user.getCurrentUser.queryOptions(),
  );

  const { data: myJobs, isLoading } = useQuery(
    trpc.job.getMyJobs.queryOptions(),
  );

  const stats = useMemo(() => {
    if (!myJobs || !currentUser) return null;

    const isClientView = role === 'client';

    // Filter jobs based on role and user's relationship to the job
    const relevantJobs = myJobs.filter((job) => {
      if (isClientView) {
        return job.userId === currentUser.id;
      } else {
        return job.freelancerWallet === currentUser.walletAddress;
      }
    });

    // Metrics
    const activeJobs = relevantJobs.filter(
      (j) => !['COMPLETED', 'CANCELLED'].includes(j.status),
    );
    const completedJobs = relevantJobs.filter((j) => j.status === 'COMPLETED');
    const disputedJobs = relevantJobs.filter((j) => j.status === 'DISPUTED');

    const totalVolume = relevantJobs.reduce(
      (acc, j) => acc + BigInt(j.totalAmount.toString()),
      0n,
    );

    const pendingMilestones = relevantJobs
      .flatMap((j) => j.milestones)
      .filter((m) =>
        ['PENDING', 'IN_PROGRESS', 'SUBMITTED'].includes(m.status),
      );

    // Chart 1: Spending/Revenue Over Time (Last 6 months)
    const end = new Date();
    const start = subMonths(startOfMonth(end), 5);
    const months = eachMonthOfInterval({ start, end });

    const chartData = months.map((month) => {
      const amount = relevantJobs
        .filter((j) => isSameMonth(new Date(j.createdAt), month))
        .reduce((acc, j) => acc + BigInt(j.totalAmount.toString()), 0n);

      return {
        month: format(month, 'MMM'),
        amount: Number(formatEther(amount)),
      };
    });

    // Chart 2: Status Distribution
    const statusCounts = relevantJobs.reduce(
      (acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));

    const metrics = isClientView
      ? [
          {
            label: 'Active Jobs',
            value: activeJobs.length.toString(),
            icon: Briefcase,
            color: 'text-blue-600',
          },
          {
            label: 'Total Budgeted',
            value: `${formatEther(totalVolume)} ETH`,
            icon: Wallet,
            color: 'text-green-600',
          },
          {
            label: 'Pending Milestones',
            value: pendingMilestones.length.toString(),
            icon: Clock,
            color: 'text-orange-600',
          },
          {
            label: 'In Dispute',
            value: disputedJobs.length.toString(),
            icon: AlertCircle,
            color: 'text-red-600',
          },
        ]
      : [
          {
            label: 'Active Contracts',
            value: activeJobs.length.toString(),
            icon: Briefcase,
            color: 'text-purple-600',
          },
          {
            label: 'Total Earned',
            value: `${formatEther(BigInt(currentUser.totalEarned.toString()))} ETH`,
            icon: Wallet,
            color: 'text-green-600',
          },
          {
            label: 'Completed Jobs',
            value: completedJobs.length.toString(),
            icon: CheckCircle2,
            color: 'text-blue-600',
          },
          {
            label: 'Pending Payment',
            value: `${formatEther(pendingMilestones.reduce((acc, m) => acc + BigInt(m.amount.toString()), 0n))} ETH`,
            icon: Clock,
            color: 'text-orange-600',
          },
        ];

    return { metrics, statusData, chartData };
  }, [myJobs, currentUser, role]);

  if (isLoading) {
    return (
      <div className='h-[calc(100vh-80px)] flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className='h-[calc(100vh-80px)] overflow-y-auto'>
      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Escrow Overview
            </h1>
            <p className='text-muted-foreground'>
              Manage your trustless freelance contracts and milestones.
            </p>
          </div>

          <Tabs
            value={role}
            onValueChange={(v) => setRole(v as any)}
            className='w-full md:w-[400px]'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='client'>Client View</TabsTrigger>
              <TabsTrigger value='freelancer'>Freelancer View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {stats.metrics.map((m, i) => (
            <Card key={i} className='hover:shadow-md transition-shadow'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{m.label}</CardTitle>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-full lg:col-span-4'>
            <CardHeader>
              <CardTitle>
                {role === 'client' ? 'Total Spend' : 'Revenue'} Over Time
              </CardTitle>
              <CardDescription>
                Monthly volume from the FreelanceEscrow contract (ETH).
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[350px]'>
              <ChartContainer config={chartConfig} className='h-full w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={stats.chartData}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey='month'
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value} ETH`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey='amount'
                      fill={role === 'client' ? '#2563eb' : '#8b5cf6'}
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className='col-span-full lg:col-span-3'>
            <CardHeader>
              <CardTitle>Job Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of current on-chain statuses.
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[300px] flex flex-col justify-center'>
              <ChartContainer config={chartConfig} className='h-full w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className='grid grid-cols-2 gap-2 mt-4'>
                {stats.statusData.map((d, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-2 text-xs font-medium'
                  >
                    <div
                      className='w-3 h-3 rounded-full shrink-0'
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className='truncate'>{d.name}</span>
                    <span className='ml-auto text-muted-foreground'>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
