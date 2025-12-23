import { formatEther } from 'viem';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';

import {
  Search,
  Briefcase,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Filter,
  Activity,
  History,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

import SpotlightCard from '@/components/react-bits/SpotlightCard';
import DecryptedText from '@/components/react-bits/DecryptedText';
import ShinyText from '@/components/react-bits/ShinyText';

export const Route = createFileRoute('/(public)/explorer')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'milestones'>(
    'all',
  );

  const { data, isLoading } = useQuery(
    trpc.job.getExplorerData.queryOptions({
      query: searchQuery,
      type:
        activeTab === 'all'
          ? 'ALL'
          : activeTab === 'jobs'
            ? 'JOBS'
            : 'MILESTONES',
    }),
  );

  const timelineItems = useMemo(() => {
    if (!data) return [];

    const items = [
      ...(data.jobs?.map((job) => ({
        type: 'JOB' as const,
        id: job.id,
        title: job.title,
        description: job.description,
        timestamp: new Date(job.createdAt),
        amount: job.totalAmount,
        user: job.user,
        status: job.status,
      })) || []),
      ...(data.milestones?.map((m) => ({
        type: 'MILESTONE' as const,
        id: m.id,
        title: m.description,
        description: `Milestone for: ${m.job.title}`,
        timestamp: new Date(m.updatedAt),
        amount: m.amount.toString(),
        user: m.job.user,
        status: m.status,
      })) || []),
    ];

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [data]);

  return (
    <div className='min-h-screen bg-black text-white selection:bg-primary/30'>
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse' />
        <div className='absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700' />
      </div>

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='text-center space-y-8 mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md'
          >
            <Activity className='w-4 h-4 text-primary animate-pulse' />
            <ShinyText text='Real-time Blockchain Activity' speed={3} />
          </motion.div>

          <div className='space-y-4'>
            <h1 className='text-5xl md:text-7xl font-black tracking-tighter'>
              <DecryptedText
                text='EXPLORE THE FUTURE'
                animateOn='view'
                className='bg-clip-text text-transparent bg-linear-to-b from-white to-white/50'
              />
            </h1>
            <p className='text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed'>
              Unveiling the trustless economy. Search, track, and verify every
              milestone and contract on the chain in real-time.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className='max-w-3xl mx-auto relative group'
          >
            <div className='absolute -inset-1 bg-linear-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200' />
            <div className='relative flex items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2'>
              <Search className='w-6 h-6 ml-4 text-white/40' />
              <input
                placeholder='Search by job title, description, or wallet address...'
                className='bg-transparent w-full border-none text-lg h-14  placeholder:text-white/20 focus:border-none'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                size='lg'
                className='rounded-xl px-8 font-bold shadow-xl shadow-primary/20'
              >
                Explore
              </Button>
            </div>
          </motion.div>
        </div>

        <Tabs
          defaultValue='all'
          className='space-y-12'
          onValueChange={(v) => setActiveTab(v as any)}
        >
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <TabsList className='bg-white/5 border border-white/10 p-1 rounded-xl h-14'>
              <TabsTrigger
                value='all'
                className='rounded-lg px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white'
              >
                All Activity
              </TabsTrigger>
              <TabsTrigger
                value='jobs'
                className='rounded-lg px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white'
              >
                Jobs
              </TabsTrigger>
              <TabsTrigger
                value='milestones'
                className='rounded-lg px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white'
              >
                Milestones
              </TabsTrigger>
            </TabsList>

            <div className='flex items-center gap-4'>
              <Badge
                variant='outline'
                className='h-10 px-4 bg-white/5 border-white/10 text-white/60'
              >
                <TrendingUp className='w-3 h-3 mr-2' />
                High Volume
              </Badge>
              <Button
                variant='outline'
                size='icon'
                className='h-10 w-10 bg-white/5 border-white/10'
              >
                <Filter className='w-4 h-4' />
              </Button>
            </div>
          </div>

          <TabsContent value='all' className='mt-0'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
              {/* Timeline View */}
              <div className='lg:col-span-2 space-y-8'>
                <div className='flex items-center gap-3 mb-8'>
                  <div className='p-2 rounded-lg bg-primary/10'>
                    <History className='w-5 h-5 text-primary' />
                  </div>
                  <h3 className='text-2xl font-bold'>Live Feed</h3>
                </div>

                <div className='relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent'>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className='relative h-32 bg-white/5 rounded-2xl animate-pulse'
                      />
                    ))
                  ) : timelineItems.length > 0 ? (
                    timelineItems.map((item, i) => (
                      <motion.div
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'
                      >
                        {/* Dot */}
                        <div className='flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                          {item.type === 'JOB' ? (
                            <Briefcase className='w-4 h-4 text-primary' />
                          ) : (
                            <CheckCircle2 className='w-4 h-4 text-green-500' />
                          )}
                        </div>

                        {/* Card */}
                        <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-1'>
                          <SpotlightCard className='bg-white/5 border-white/10 p-6 rounded-2xl'>
                            <div className='flex items-center justify-between mb-4'>
                              <Badge
                                variant='secondary'
                                className='bg-white/10 text-white/80'
                              >
                                {item.type}
                              </Badge>
                              <span className='text-xs text-white/40'>
                                {format(item.timestamp, 'HH:mm:ss')}
                              </span>
                            </div>
                            <h4 className='font-bold text-lg mb-2 group-hover:text-primary transition-colors'>
                              {item.title}
                            </h4>
                            <p className='text-sm text-white/50 line-clamp-2 mb-4'>
                              {item.description}
                            </p>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-6 w-6'>
                                  <AvatarImage src={item.user?.image || ''} />
                                  <AvatarFallback className='text-[10px] bg-white/10'>
                                    {item.user?.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='text-xs text-white/60 font-medium'>
                                  {item.user?.name || 'Anonymous'}
                                </span>
                              </div>
                              <div className='flex items-center gap-4'>
                                <div className='text-sm font-bold text-primary'>
                                  {formatEther(BigInt(item.amount || '0'))} ETH
                                </div>
                                <Link
                                  to='/jobs/$id'
                                  params={{
                                    id:
                                      item.type === 'JOB'
                                        ? item.id
                                        : data?.milestones?.find(
                                            (m) => m.id === item.id,
                                          )?.jobId || '',
                                  }}
                                  className='p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'
                                >
                                  <ArrowRight className='w-4 h-4 text-white/40' />
                                </Link>
                              </div>
                            </div>
                          </SpotlightCard>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className='text-center py-20'>
                      <p className='text-white/40'>
                        No activity found for your search.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className='space-y-8'>
                <div className='flex items-center gap-3 mb-8'>
                  <div className='p-2 rounded-lg bg-blue-500/10'>
                    <TrendingUp className='w-5 h-5 text-blue-500' />
                  </div>
                  <h3 className='text-2xl font-bold'>Network Stats</h3>
                </div>

                <div className='grid gap-6'>
                  <SpotlightCard className='bg-white/5 border-white/10 p-6 rounded-2xl space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-white/40 text-sm'>
                        Total Value Locked
                      </span>
                      <Wallet className='w-4 h-4 text-primary' />
                    </div>
                    <div className='text-3xl font-black'>1,284.50 ETH</div>
                    <div className='text-xs text-green-500 flex items-center gap-1'>
                      <TrendingUp className='w-3 h-3' />
                      +12.5% from last week
                    </div>
                  </SpotlightCard>

                  <SpotlightCard className='bg-white/5 border-white/10 p-6 rounded-2xl space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-white/40 text-sm'>
                        Active Contracts
                      </span>
                      <ShieldCheck className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='text-3xl font-black'>452</div>
                    <div className='flex -space-x-2'>
                      {[1, 2, 3, 4].map((i) => (
                        <Avatar
                          key={i}
                          className='h-8 w-8 border-2 border-black'
                        >
                          <AvatarFallback className='bg-white/10 text-[10px]'>
                            {i}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <div className='h-8 w-8 rounded-full bg-white/5 border-2 border-black flex items-center justify-center text-[10px] text-white/40'>
                        +448
                      </div>
                    </div>
                  </SpotlightCard>

                  {/* Top Categories */}
                  <div className='p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6'>
                    <h4 className='font-bold flex items-center gap-2'>
                      <TrendingUp className='w-4 h-4 text-primary' />
                      Top Categories
                    </h4>
                    <div className='space-y-4'>
                      {[
                        { name: 'DeFi', count: 142, color: 'bg-blue-500' },
                        { name: 'Security', count: 89, color: 'bg-primary' },
                        { name: 'NFTs', count: 64, color: 'bg-purple-500' },
                        {
                          name: 'Infrastructure',
                          count: 45,
                          color: 'bg-orange-500',
                        },
                      ].map((cat) => (
                        <div key={cat.name} className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-white/60'>{cat.name}</span>
                            <span className='font-bold'>{cat.count}</span>
                          </div>
                          <div className='h-1.5 w-full bg-white/5 rounded-full overflow-hidden'>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{
                                width: `${(cat.count / 142) * 100}%`,
                              }}
                              className={cn('h-full rounded-full', cat.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs Content would go here, but 'all' handles the combined view nicely */}
          <TabsContent value='jobs'>
            {/* Similar structure but filtered for jobs */}
          </TabsContent>
          <TabsContent value='milestones'>
            {/* Similar structure but filtered for milestones */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer CTA */}
      <div className='relative border-t border-white/10 bg-white/5 backdrop-blur-3xl py-20 overflow-hidden'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent' />
        <div className='max-w-4xl mx-auto px-4 text-center space-y-8'>
          <h2 className='text-4xl font-black'>Ready to Build the Future?</h2>
          <p className='text-white/60 text-lg'>
            Join thousands of developers and clients building the next
            generation of trustless applications.
          </p>
          <div className='flex flex-wrap justify-center gap-4'>
            <Button
              size='lg'
              className='h-14 px-10 rounded-2xl font-bold text-lg'
            >
              Post a Job
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='h-14 px-10 rounded-2xl font-bold text-lg bg-white/5 border-white/10'
            >
              Browse Developers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
