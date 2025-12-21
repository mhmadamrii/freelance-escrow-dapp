import abi from '@/lib/abi.json';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTRPC } from '@/utils/trpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FREELANCE_ESCROW_ADDRESS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { encodePacked, keccak256 } from 'viem';

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

import {
  Card,
  CardAction,
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
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const { id } = Route.useParams();

  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  const { data } = useQuery(
    trpc.job.getMilestonesByJobId.queryOptions({
      jobId: id,
    }),
  );

  const { mutate } = useMutation(
    trpc.job.updateMilestones.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Milestone status updated successfully!');
      },
    }),
  );

  const handleSubmitMilestone = (onChainIndex: number) => {
    try {
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
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleApproveMilestone = (
    mileStoneId: string,
    onChainIndex: number,
  ) => {
    setSelectedMilestone(id);
    console.log('id', id);
    mutate({
      milestoneId: mileStoneId,
      status: 'COMPLETED',
    });
    try {
      writeContract({
        address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
        abi,
        functionName: 'approveMilestone',
        args: [BigInt(data?.onChainId ?? 0), BigInt(onChainIndex)],
      });
    } catch (error) {}
  };

  useEffect(() => {
    if (isSuccess) {
      mutate({
        milestoneId: selectedMilestone,
        status: 'COMPLETED',
      });
    }
  }, [isSuccess]);

  return (
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      {data?.milestones?.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>Card Action</CardAction>
          </CardHeader>
          <CardContent>
            <h1>Status: {item.status}</h1>
            <h1>{item.amount}</h1>
            <h1>{item.descriptionHash}</h1>
            {data.clientWallet === address && item.status == 'SUBMITTED' && (
              <Button
                onClick={() =>
                  handleApproveMilestone(item.id, item.onChainIndex)
                }
              >
                Approve Milestone
              </Button>
            )}
            <div
              className={cn('w-full flex gap-2', {
                hidden: address == data.clientWallet,
              })}
            >
              <Button
                disabled={item.status !== 'IN_PROGRESS'}
                onClick={() => handleSubmitMilestone(item.onChainIndex)}
              >
                Submit Milestone
              </Button>
              <Button
                disabled={item.status !== 'PENDING'}
                onClick={() =>
                  mutate({
                    milestoneId: item.id,
                    status: 'IN_PROGRESS',
                  })
                }
              >
                Start Working
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
