import abi from '@/lib/abi.json';

import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

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

interface AssignFreelancerProps {
  jobId: string;
  onChainId: string;
  freelancerAddress: string;
  applicationId: string;
  freelancerWallet: string;
}

export function AssignFreelancer({
  jobId,
  onChainId,
  freelancerAddress,
  applicationId,
  freelancerWallet,
}: AssignFreelancerProps) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);

  const { address } = useAccount();

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { mutate } = useMutation(
    trpc.job.assignFreelancerWalletToJob.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Job is waiting to be funded!');
      },
      onError: (err) => {
        console.log('error', err);
        toast.error('Error assigning freelancer');
      },
    }),
  );

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Freelancer assigned successfully!');
      setOpen(false);
      mutate({ jobId, applicationId, freelancerWallet });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (writeError) {
      toast.error(`Error assigning freelancer: ${writeError.message}`);
    }
  }, [writeError]);

  const handleAssignFreelancer = () => {
    writeContract({
      address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: 'assignFreelancer',
      args: [BigInt(onChainId ?? 0n), freelancerAddress as `0x${string}`],
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className='w-full' size='sm'>
          Assign Freelancer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Freelancer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to assign this freelancer? This action will
            set the freelancer for this job on the blockchain.
            <br />
            <br />
            <span className='font-mono text-xs bg-muted p-1 rounded'>
              {freelancerAddress}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isConfirming}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleAssignFreelancer();
            }}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isPending ? 'Confirming...' : 'Processing...'}
              </>
            ) : (
              'Confirm Assignment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
