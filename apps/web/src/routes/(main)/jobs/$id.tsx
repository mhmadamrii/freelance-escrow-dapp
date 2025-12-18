import { Button } from '@/components/ui/button';
import abi from '@/lib/abi.json';

import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

export const Route = createFileRoute('/(main)/jobs/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { id } = Route.useParams();

  const { address } = useAccount();

  const { data } = useQuery(
    trpc.job.jobById.queryOptions({
      jobId: id,
    }),
  );

  const { data: hash, writeContract, isPending } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleAssignFreelancer = async () => {
    try {
      writeContract({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with actual contract address
        abi: abi,
        functionName: 'assignFreelancer',
        args: [BigInt(data?.onChainId ?? 0n), address],
      });
    } catch (error) {}
  };

  console.log({
    receipt,
    isConfirming,
    isSuccess,
  });

  return (
    <div className='h-screen flex-col flex justify-center items-center'>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button onClick={handleAssignFreelancer}>Assign Freelancer</Button>
    </div>
  );
}
