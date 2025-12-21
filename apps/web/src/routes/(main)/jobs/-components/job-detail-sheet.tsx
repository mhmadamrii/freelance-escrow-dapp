import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  FileUser,
  Wallet,
  ExternalLink,
  User,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from '@tanstack/react-router';
import { JobApplication } from './job-application';
import { StatusBadge } from './status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JobDetailSheetProps {
  jobId: string;
  trigger: React.ReactNode;
  userRole?: string;
}

export function JobDetailSheet({
  jobId,
  trigger,
  userRole,
}: JobDetailSheetProps) {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: job, isLoading } = useQuery(
    trpc.job.jobById.queryOptions({ jobId }),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className='sm:max-w-xl overflow-y-auto p-5'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : job ? (
          <div className='flex flex-col h-full'>
            <SheetHeader className='space-y-4 text-left'>
              <div className='flex items-center justify-between'>
                <StatusBadge status={job.status} />
                <span className='text-xs text-muted-foreground'>
                  ID: {job.id.slice(0, 8)}...
                </span>
              </div>
              <SheetTitle className='text-2xl font-bold'>
                {job.title}
              </SheetTitle>
              <SheetDescription className='text-base leading-relaxed'>
                {job.description}
              </SheetDescription>
            </SheetHeader>

            <div className='mt-8 space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-lg border bg-card p-4'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
                    <Wallet className='h-4 w-4' />
                    Budget
                  </div>
                  <div className='text-lg font-bold text-primary'>
                    {formatEther(BigInt(job.totalAmount))}{' '}
                    {job.tokenAddress ? 'TOKEN' : 'ETH'}
                  </div>
                </div>
                <div className='rounded-lg border bg-card p-4'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
                    <Clock className='h-4 w-4' />
                    Milestones
                  </div>
                  <div className='text-lg font-bold'>
                    {job.milestones.length} Stages
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-semibold flex items-center gap-2 text-lg'>
                  <User className='h-5 w-5' /> Client Information
                </h3>
                <div className='flex items-center gap-4 rounded-xl border p-4 bg-muted/30'>
                  <Avatar className='h-12 w-12 border-2 border-background'>
                    <AvatarImage src={job.user?.image || ''} />
                    <AvatarFallback>
                      {job.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>
                      {job.user?.name || 'Anonymous'}
                    </p>
                    <p className='text-sm text-muted-foreground truncate'>
                      {job.clientWallet}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-semibold flex items-center gap-2 text-lg'>
                  <CheckCircle2 className='h-5 w-5' /> Job Stats
                </h3>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground flex items-center gap-2'>
                      <Calendar className='h-4 w-4' /> Posted on
                    </span>
                    <span className='font-medium'>
                      {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground flex items-center gap-2'>
                      <FileUser className='h-4 w-4' /> Applications
                    </span>
                    <span className='font-medium'>
                      {job.jobApplications.length} Applicants
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className='my-8' />

            <SheetFooter className='mt-auto flex-col gap-3 sm:flex-col'>
              {userRole === 'FREELANCER' && (
                <JobApplication
                  clientWallet={job.clientWallet}
                  jobDesc={job.description}
                  jobId={job.id}
                />
              )}
              <Button
                variant='outline'
                className='w-full gap-2'
                onClick={() =>
                  navigate({ to: '/jobs/$id', params: { id: job.id } })
                }
              >
                <ExternalLink className='h-4 w-4' />
                View Full Details
              </Button>
            </SheetFooter>
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <p className='text-muted-foreground'>Job not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
