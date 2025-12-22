import abi from '@/lib/abi.json';

import { useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, Check, CheckCircle, Loader2 } from 'lucide-react';
import { useTRPC } from '@/utils/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RaiseDisputeProps {
  jobId: string; // The DB UUID
  onChainJobId: number; // The uint256 ID from the contract
  isDisable: boolean;
  isConfirmComplete: boolean;
}

export function RaiseDispute({
  jobId,
  onChainJobId,
  isDisable,
  isConfirmComplete,
}: RaiseDisputeProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data: hash,
    writeContract,
    isPending: isWalletPending,
  } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const { mutate: updateDbStatus } = useMutation(
    trpc.job.updateJobStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Job has been moved to Disputed status');
      },
    }),
  );

  const { mutate: updateJobStatus } = useMutation(
    trpc.job.updateJobStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Job has been successfully completed');
      },
    }),
  );

  const handleRaiseDispute = () => {
    writeContract({
      address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: 'raiseDispute',
      args: [BigInt(onChainJobId)],
    });
  };

  const isProcessing = isWalletPending || isTxLoading;

  useEffect(() => {
    if (isTxSuccess) {
      updateDbStatus({
        jobId: jobId,
        status: 'DISPUTED',
      });
    }
  }, [isTxSuccess]);

  return (
    <AlertDialog>
      <div className='flex gap-2 items-center'>
        {isConfirmComplete ? (
          <Button
            onClick={() => {
              updateJobStatus({
                jobId: jobId,
                status: 'COMPLETED',
              });
            }}
          >
            <CheckCircle className='h-4 w-4' />
            Confirm Complete
          </Button>
        ) : (
          <AlertDialogTrigger asChild>
            <Button
              disabled={isDisable}
              variant='destructive'
              className='gap-2'
            >
              <AlertTriangle className='h-4 w-4' />
              Raise Dispute
            </Button>
          </AlertDialogTrigger>
        )}
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will lock the remaining funds in escrow. An arbiter will need
            to manually review the case and decide the final payout for both
            parties. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent closing until we trigger
              handleRaiseDispute();
            }}
            disabled={isProcessing}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isProcessing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              'Confirm Dispute'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
