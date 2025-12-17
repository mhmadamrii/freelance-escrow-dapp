import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { parseUnits, keccak256, toHex, encodePacked } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';
import abi from '@/lib/abi.json';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/(main)/jobs/create/')({
  component: RouteComponent,
});

const ETH_DEFAULT_TOKEN = '0x0000000000000000000000000000000000000000';
const ARBITER_DEFAULT_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

function RouteComponent() {
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [arbiterAddress, setArbiterAddress] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [milestones, setMilestones] = useState<
    { description: string; amount: string }[]
  >([{ description: '', amount: '' }]);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (
    index: number,
    field: 'description' | 'amount',
    value: string,
  ) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      // Generate hashes
      const jobHash = keccak256(
        encodePacked(['string', 'string'], [title, description]),
      );

      const milestoneHashes = milestones.map((m) =>
        keccak256(encodePacked(['string'], [m.description])),
      );

      const milestoneAmounts = milestones.map((m) => parseUnits(m.amount, 18)); // Assuming 18 decimals for now
      const totalAmountParsed = parseUnits(totalAmount, 18);

      // Validate total amount matches sum of milestones
      const sumMilestones = milestoneAmounts.reduce((a, b) => a + b, 0n);
      if (sumMilestones !== totalAmountParsed) {
        toast.error('Total amount must equal the sum of milestone amounts');
        return;
      }

      writeContract({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with actual contract address
        abi: abi,
        functionName: 'createJob',
        args: [
          tokenAddress,
          totalAmountParsed,
          arbiterAddress,
          jobHash,
          milestoneAmounts,
          milestoneHashes,
        ],
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to create job');
    }
  };

  if (isSuccess) {
    toast.success('Job created successfully!');
  }

  return (
    <div className='container mx-auto py-10 max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Job</CardTitle>
          <CardDescription>
            Post a job and set up milestones for secure payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Job Title</Label>
              <Input
                id='title'
                placeholder='e.g. Smart Contract Audit'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                placeholder='Detailed description of the job...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='token'>Token Address</Label>
                <Input
                  id='token'
                  placeholder='0x...'
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='arbiter'>Arbiter Address</Label>
                <Input
                  id='arbiter'
                  placeholder='0x...'
                  value={arbiterAddress}
                  onChange={(e) => setArbiterAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='totalAmount'>Total Amount</Label>
              <Input
                id='totalAmount'
                type='number'
                step='0.000001'
                placeholder='1000'
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label>Milestones</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddMilestone}
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Milestone
                </Button>
              </div>

              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className='flex gap-4 items-start p-4 border rounded-lg bg-muted/50'
                >
                  <div className='flex-1 space-y-4'>
                    <div className='space-y-2'>
                      <Label className='text-xs'>Description</Label>
                      <Input
                        value={milestone.description}
                        onChange={(e) =>
                          handleMilestoneChange(
                            index,
                            'description',
                            e.target.value,
                          )
                        }
                        placeholder='Milestone description'
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-xs'>Amount</Label>
                      <Input
                        type='number'
                        step='0.000001'
                        value={milestone.amount}
                        onChange={(e) =>
                          handleMilestoneChange(index, 'amount', e.target.value)
                        }
                        placeholder='Amount'
                        required
                      />
                    </div>
                  </div>
                  {milestones.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='mt-8 text-destructive hover:text-destructive'
                      onClick={() => handleRemoveMilestone(index)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  {isPending ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                'Create Job'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
