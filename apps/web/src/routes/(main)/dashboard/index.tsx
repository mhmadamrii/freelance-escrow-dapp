import { createFileRoute } from '@tanstack/react-router';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

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
} from 'lucide-react';

export const Route = createFileRoute('/(main)/dashboard/')({
  component: RouteComponent,
});

const clientData = {
  metrics: [
    {
      label: 'Active Jobs',
      value: '12',
      icon: Briefcase,
      color: 'text-blue-600',
    },
    {
      label: 'Total Funded',
      value: '45.5 ETH',
      icon: Wallet,
      color: 'text-green-600',
    },
    {
      label: 'Pending Milestones',
      value: '8',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      label: 'In Dispute',
      value: '1',
      icon: AlertCircle,
      color: 'text-red-600',
    },
  ],
  statusData: [
    { name: 'Funded', value: 4 },
    { name: 'In Progress', value: 6 },
    { name: 'Completed', value: 2 },
  ],
  spending: [
    { month: 'Jan', amount: 4000 },
    { month: 'Feb', amount: 3000 },
    { month: 'Mar', amount: 5500 },
  ],
};

const freelancerData = {
  metrics: [
    {
      label: 'Active Contracts',
      value: '5',
      icon: Briefcase,
      color: 'text-purple-600',
    },
    {
      label: 'Total Earned',
      value: '28.2 ETH',
      icon: Wallet,
      color: 'text-green-600',
    },
    {
      label: 'Submissions',
      value: '14',
      icon: CheckCircle2,
      color: 'text-blue-600',
    },
    {
      label: 'Pending Payment',
      value: '3.4 ETH',
      icon: Clock,
      color: 'text-orange-600',
    },
  ],
  statusData: [
    { name: 'Completed', value: 10 },
    { name: 'In Progress', value: 5 },
    { name: 'Disputed', value: 0 },
  ],
  spending: [
    { month: 'Jan', amount: 2100 },
    { month: 'Feb', amount: 4800 },
    { month: 'Mar', amount: 3900 },
  ],
};

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function RouteComponent() {
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const data = role === 'client' ? clientData : freelancerData;

  return (
    <div className='h-[calc(100vh-80px)] overflow-hidden'>
      <div className='max-w-7xl mx-auto py-8 space-y-8'>
        <div className='flex justify-between items-center'>
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
            className='w-[400px]'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='client'>Client View</TabsTrigger>
              <TabsTrigger value='freelancer'>Freelancer View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {data.metrics.map((m, i) => (
            <Card key={i}>
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

        <ChartContainer className='h-112 w-full' config={chartConfig}>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>
                  {role === 'client' ? 'Total Spend' : 'Revenue'} Over Time
                </CardTitle>
                <CardDescription>
                  Monthly volume from the FreelanceEscrow contract.
                </CardDescription>
              </CardHeader>
              <CardContent className='h-75'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={data.spending}>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey='amount'
                      fill={role === 'client' ? '#2563eb' : '#8b5cf6'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of current on-chain statuses.
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data.statusData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {data.statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className='flex justify-center gap-4 text-xs font-medium'>
                  {data.statusData.map((d, i) => (
                    <div key={i} className='flex items-center gap-1'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      {d.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
