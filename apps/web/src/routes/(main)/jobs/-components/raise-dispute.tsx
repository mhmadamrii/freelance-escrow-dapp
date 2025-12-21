import abi from '@/lib/abi.json';

import { useEffect } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
}

export function RaiseDispute({ jobId, onChainJobId }: RaiseDisputeProps) {
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

  const handleRaiseDispute = () => {
    writeContract({
      address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: 'raiseDispute',
      args: [BigInt(onChainJobId)],
    });
  };

  const isProcessing = isWalletPending || isTxLoading;

  // Update DB once the blockchain confirms the dispute
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
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='sm' className='gap-2'>
          <AlertTriangle className='h-4 w-4' />
          Raise Dispute
        </Button>
      </AlertDialogTrigger>
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
