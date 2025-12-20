import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTRPC } from '@/utils/trpc';
import type { JobByIdOutput } from '@onwork/api/routers/job';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

export function JobMilestones({ job }: { job: JobByIdOutput | undefined }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const { mutate: updateStatus, isPending } = useMutation(
    trpc.job.updateJobStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Job status updated successfully!');
      },
    }),
  );

  return (job?.milestones || []).map((milestone, index) => (
    <Card
      key={milestone.id}
      className='overflow-hidden border-l-4 border-l-primary/50'
    >
      <CardContent className='p-6 flex items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h3 className='font-semibold'>Milestone {index + 1}</h3>
          <p className='text-sm text-muted-foreground truncate max-w-md'>
            {milestone.descriptionHash}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-xl font-bold'>
            {formatEther(BigInt(milestone.amount))}{' '}
            {job?.tokenAddress ? 'TOKEN' : 'ETH'}
          </p>
          <Badge variant={milestone.submissionHash ? 'default' : 'secondary'}>
            {milestone.submissionHash && 'Submitted'}
          </Badge>
          {job?.status == 'FUNDED' && job?.freelancerWallet == address && (
            <Button
              disabled={isPending}
              onClick={() =>
                updateStatus({
                  jobId: job.id,
                  status: 'IN_PROGRESS',
                })
              }
            >
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Start working
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  ));
}
