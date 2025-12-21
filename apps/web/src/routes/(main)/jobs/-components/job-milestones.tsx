import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { JobByIdOutput } from '@onwork/api/routers/job';
import { formatEther } from 'viem';

export function JobMilestones({ job }: { job: JobByIdOutput | undefined }) {
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
        </div>
      </CardContent>
    </Card>
  ));
}
