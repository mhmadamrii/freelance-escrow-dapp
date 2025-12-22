import abi from '@/lib/abi.json';
import { RaiseDispute } from '../../-components/raise-dispute';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTRPC } from '@/utils/trpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { encodePacked, keccak256 } from 'viem';
import { AlertCircleIcon, Loader2 } from 'lucide-react'; // Suggested for loading states

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/(main)/jobs/$id/milestones/')({
  component: RouteComponent,
});

const SUBMISSION_PLACEHOLDER = 'some placeholder';

function RouteComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { id } = Route.useParams();
  const { address } = useAccount();

  // Local state to track which milestone is being processed on-chain
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    null,
  );

  const {
    data: hash,
    writeContract,
    isPending: isWalletPending,
  } = useWriteContract();

  const { data } = useQuery(
    trpc.job.getMilestonesByJobId.queryOptions({ jobId: id }),
  );

  console.log('data', data);

  const { mutate: updateStatus } = useMutation(
    trpc.job.updateMilestones.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Status updated in database');
        setActiveMilestoneId(null);
      },
      onError: (err) => {
        toast.error('Failed to update database status');
        console.error(err);
      },
    }),
  );

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleSubmitMilestone = (milestoneId: string, onChainIndex: number) => {
    setActiveMilestoneId(milestoneId);
    writeContract({
      address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: 'submitMilestone',
      args: [
        BigInt(data?.onChainId ?? 0),
        BigInt(onChainIndex),
        keccak256(encodePacked(['string'], [SUBMISSION_PLACEHOLDER])),
      ],
    });
  };

  const handleApproveMilestone = (
    milestoneId: string,
    onChainIndex: number,
  ) => {
    setActiveMilestoneId(milestoneId);
    writeContract({
      address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: 'approveMilestone',
      args: [BigInt(data?.onChainId ?? 0), BigInt(onChainIndex)],
    });
  };

  const isProcessing = isWalletPending || isTxLoading;

  // Effect: When the blockchain transaction hits the block, update our DB
  useEffect(() => {
    if (isTxSuccess && activeMilestoneId) {
      // Determine the next status based on current UI state or context
      // Here we assume if a Tx completes and we have an active ID, it was a 'SUBMITTED' or 'COMPLETED' action
      const milestone = data?.milestones.find(
        (m) => m.id === activeMilestoneId,
      );
      const newStatus =
        milestone?.status === 'IN_PROGRESS' ? 'SUBMITTED' : 'COMPLETED';
      console.log('new status', newStatus);

      updateStatus({
        milestoneId: activeMilestoneId,
        status: newStatus,
      });
    }
  }, [isTxSuccess, activeMilestoneId, data]);

  return (
    <div className='container mx-auto max-w-6xl px-4 py-8 flex flex-col gap-6'>
      {data?.status == 'DISPUTED' ? (
        <div>
          <Alert variant='destructive'>
            <AlertCircleIcon />
            <AlertTitle>Disputed</AlertTitle>
            <AlertDescription>
              This job has been disputed and is now in the dispute state
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className='flex w-full justify-between items-center'>
          <h1 className='text-2xl font-bold'>Job Milestones</h1>
          <RaiseDispute
            jobId={id}
            onChainJobId={Number(data?.onChainId ?? 0)}
            isDisable={
              (data?.milestones.every((m) => m.status === 'COMPLETED') ||
                data?.milestones.every((m) => m.status === 'PENDING')) ??
              false
            }
            isConfirmComplete={
              data?.milestones.every((m) => m.status === 'COMPLETED') ?? false
            }
          />
        </div>
      )}

      {data?.milestones?.map((item) => {
        const isCurrentActive = activeMilestoneId === item.id;
        const isClient = address === data.clientWallet;

        return (
          <Card
            key={item.id}
            className={cn(isCurrentActive && 'border-primary')}
          >
            <CardHeader>
              <CardTitle>Milestone {item.onChainIndex}</CardTitle>
              <CardDescription>
                Status:{' '}
                <span className='font-mono font-bold text-foreground'>
                  {item.status}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Amount: {item.amount} ETH
              </p>
              <p className='text-xs truncate text-muted-foreground'>
                Hash: {item.descriptionHash}
              </p>
            </CardContent>

            <CardFooter className='flex gap-2'>
              {isClient && item.status === 'SUBMITTED' && (
                <Button
                  disabled={isProcessing}
                  onClick={() =>
                    handleApproveMilestone(item.id, item.onChainIndex)
                  }
                >
                  {isCurrentActive && isProcessing && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Approve & Pay Milestone
                </Button>
              )}

              {/* FREELANCER ACTIONS */}
              {!isClient && (
                <>
                  {item.status === 'PENDING' && (
                    <Button
                      onClick={() =>
                        updateStatus({
                          milestoneId: item.id,
                          status: 'IN_PROGRESS',
                        })
                      }
                    >
                      Start Working
                    </Button>
                  )}

                  {item.status === 'IN_PROGRESS' && (
                    <Button
                      disabled={isProcessing}
                      onClick={() =>
                        handleSubmitMilestone(item.id, item.onChainIndex)
                      }
                    >
                      {isCurrentActive && isProcessing && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      Submit Work
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
