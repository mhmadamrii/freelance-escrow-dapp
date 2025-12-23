import abi from '@/lib/abi.json';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { Loader2 } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useNavigate } from '@tanstack/react-router';

interface JobActionsProps {
  job: any;
  isClient: boolean;
  isFreelancer: boolean;
  hasApplied: boolean;
}

export function JobActions({
  job,
  isClient,
  isFreelancer,
  hasApplied,
}: JobActionsProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: hash, writeContract, isPending } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const { mutate: updateJobStatus } = useMutation(
    trpc.job.updateJobStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Job funded successfully!');
        navigate({
          to: '/jobs/$id/milestones',
          params: {
            id: job.id,
          },
        });
      },
      onError: (err) => {
        console.error('Error updating job status:', err);
        toast.error('Failed to update job status');
      },
    }),
  );

  const handleFundJob = () => {
    try {
      if (!job?.jobApplications || job.jobApplications.length === 0) {
        return toast.error('No freelancer assigned to this job');
      }

      writeContract({
        address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
        abi: abi,
        functionName: 'fundJob',
        args: [BigInt(job.onChainId?.toString() ?? '0')],
        value: BigInt(job.totalAmount ?? '0'),
      });
    } catch (error) {
      console.error('Error funding job:', error);
      toast.error('Failed to fund job. Please try again.');
    }
  };

  useEffect(() => {
    if (isSuccess && job?.id) {
      updateJobStatus({
        jobId: job.id,
        status: 'FUNDED',
      });
    }

    if (isError) {
      toast.error('Transaction failed or was rejected.');
    }
  }, [isSuccess, isError, job?.id]);

  // Client actions
  if (isClient) {
    if (job?.status === 'CREATED' || job?.status === 'WAITING_FUNDING') {
      return (
        <Button
          disabled={isPending || isConfirming}
          onClick={handleFundJob}
          className='w-full size-lg text-lg font-semibold shadow-lg shadow-primary/20'
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {isPending ? 'Confirming...' : 'Processing...'}
            </>
          ) : (
            'Fund Job'
          )}
        </Button>
      );
    }

    return (
      <Button className='w-full' variant='outline' disabled>
        Job Funded
      </Button>
    );
  }

  // Freelancer actions
  if (isFreelancer) {
    return (
      <Button className='w-full' variant='secondary' disabled>
        Submit work via Milestones
      </Button>
    );
  }

  // Non-participant actions
  if (!hasApplied) {
    return (
      <Button className='w-full size-lg text-lg font-semibold shadow-lg shadow-primary/20'>
        Apply Now
      </Button>
    );
  }

  return (
    <Button className='w-full' variant='outline' disabled>
      Application Sent
    </Button>
  );
}
