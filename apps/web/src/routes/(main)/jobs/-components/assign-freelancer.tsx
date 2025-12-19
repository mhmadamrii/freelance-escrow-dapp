import abi from '@/lib/abi.json';

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

export function AssignFreelancer({ onChainId }: { onChainId: string }) {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  console.log({
    receipt,
    isLoading: isConfirming,
    isSuccess,
    isPending,
  });

  const handleAssignFreelancer = async () => {
    try {
      writeContract({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with actual contract address
        abi: abi,
        functionName: 'assignFreelancer',
        args: [BigInt(onChainId ?? 0n), address],
      });
    } catch (error) {}
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline'>Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAssignFreelancer}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
