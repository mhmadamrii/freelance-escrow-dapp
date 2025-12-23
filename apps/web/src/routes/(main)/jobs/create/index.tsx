import abi from '@/lib/abi.json';

import { parseUnits, keccak256, encodePacked, decodeEventLog } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ARBITER_ADDRESS, JOB_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTRPC } from '@/utils/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

import {
  Loader2,
  Plus,
  Trash2,
  Briefcase,
  Coins,
  ListChecks,
  ShieldCheck,
  Info,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const Route = createFileRoute('/(main)/jobs/create/')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<'eth' | 'token'>('eth');
  const [tokenAddress, setTokenAddress] = useState('');
  const [arbiterAddress, setArbiterAddress] = useState(ARBITER_ADDRESS[0]);
  const [totalAmount, setTotalAmount] = useState('');
  const [unit, setUnit] = useState<'ether' | 'gwei' | 'wei'>('ether');
  const [jobHash, setJobHash] = useState('');
  const [category, setCategory] =
    useState<(typeof JOB_CATEGORIES)[number]['value']>('ANY');
  const [totalAmountInWei, setTotalAmountInWei] = useState('');
  const [milestones, setMilestones] = useState<
    { description: string; amount: string }[]
  >([{ description: '', amount: '' }]);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const { mutate: createMilestones } = useMutation(
    trpc.milestone.createMilestones.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast.success('Milestones created successfully!');
        navigate({ to: '/jobs' });
      },
    }),
  );

  const { mutate, isPending: isCreatingOffChain } = useMutation(
    trpc.job.createJob.mutationOptions({
      onSuccess: (res) => {
        toast.success('Job created successfully!');
        createMilestones({
          jobId: res.id,
          milestones: milestones.map((m) => ({
            amount: m.amount,
            descriptionHash: keccak256(
              encodePacked(['string'], [m.description]),
            ),
          })),
        });
      },
      onError: (error) => {
        console.log('error', error);
        toast.error(
          `Job created on-chain but failed off-chain: ${error.message}`,
        );
      },
    }),
  );

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

  const sumMilestones = useMemo(() => {
    return milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
  }, [milestones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const jobHash = keccak256(
        encodePacked(['string', 'string'], [title, description]),
      );
      setJobHash(jobHash);

      const milestoneHashes = milestones.map((m) =>
        keccak256(encodePacked(['string'], [m.description])),
      );

      const decimals = unit === 'ether' ? 18 : unit === 'gwei' ? 9 : 0;

      const milestoneAmounts = milestones.map((m) =>
        parseUnits(m.amount, decimals),
      );
      const totalAmountParsed = parseUnits(totalAmount, decimals);

      const sumMilestonesWei = milestoneAmounts.reduce((a, b) => a + b, 0n);

      if (sumMilestonesWei !== totalAmountParsed) {
        toast.error('Total amount must equal the sum of milestone amounts');
        return;
      }

      setTotalAmountInWei(totalAmountParsed.toString());

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: 'createJob',
        args: [
          paymentType === 'token' ? tokenAddress : ZERO_ADDRESS,
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

  useEffect(() => {
    if (isSuccess && receipt) {
      let onChainId = '';
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: abi,
            data: log.data,
            topics: log.topics,
          });
          if (decodedLog.eventName === 'JobCreated') {
            onChainId = (decodedLog.args as any).jobId.toString();
            break;
          }
        } catch (e) {
          // Ignore logs that don't match the ABI
        }
      }

      if (onChainId) {
        mutate({
          title,
          description,
          jobHash,
          onChainId,
          clientWallet: address!,
          arbiter: arbiterAddress,
          totalAmount: totalAmountInWei,
          tokenAddress: paymentType === 'token' ? tokenAddress : undefined,
          category: category as (typeof JOB_CATEGORIES)[number]['value'],
        });
      } else {
        toast.error('Failed to retrieve Job ID from transaction receipt');
      }
    }
  }, [isSuccess, receipt]);

  return (
    <div className='min-h-screen bg-linear-to-b from-background to-muted/20'>
      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8'>
        <div className='flex flex-col lg:flex-row gap-12'>
          <div className='flex-1 space-y-8'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Post a New Job
              </h1>
              <p className='text-muted-foreground text-lg'>
                Create a secure, milestone-based contract for your project.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-8'>
              {/* Section 1: Job Details */}
              <Card className='border-primary/10 shadow-sm overflow-hidden'>
                <CardHeader className='bg-muted/30 pb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                      <Briefcase className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>Job Details</CardTitle>
                      <CardDescription>
                        Basic information about your project
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6 space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='title'>Job Title</Label>
                      <Input
                        id='title'
                        placeholder='e.g. Smart Contract Audit'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className='bg-muted/20'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='category'>Category</Label>
                      <Select
                        value={category}
                        onValueChange={(value) =>
                          setCategory(
                            value as (typeof JOB_CATEGORIES)[number]['value'],
                          )
                        }
                      >
                        <SelectTrigger
                          id='category'
                          className='bg-muted/20 w-full'
                        >
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      placeholder='Detailed description of the job, requirements, and deliverables...'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className='min-h-[150px] bg-muted/20 '
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Payment & Arbiter */}
              <Card className='border-primary/10 shadow-sm overflow-hidden'>
                <CardHeader className='bg-muted/30 pb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                      <Coins className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>
                        Payment & Security
                      </CardTitle>
                      <CardDescription>
                        Configure how and how much you'll pay
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6 space-y-6'>
                  <div className='space-y-4'>
                    <Label>Payment Method</Label>
                    <Tabs
                      value={paymentType}
                      onValueChange={(v) =>
                        setPaymentType(v as 'eth' | 'token')
                      }
                      className='w-full'
                    >
                      <TabsList className='grid w-full grid-cols-2 bg-muted/20'>
                        <TabsTrigger value='eth' className='gap-2'>
                          <Wallet className='h-4 w-4' /> ETH
                        </TabsTrigger>
                        <TabsTrigger value='token' className='gap-2'>
                          <Coins className='h-4 w-4' /> Token
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value='token' className='pt-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='token'>Token Address</Label>
                          <Input
                            id='token'
                            placeholder='0x...'
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            required={paymentType === 'token'}
                            className='bg-muted/20'
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='totalAmount'>Total Budget</Label>
                      <div className='flex gap-2'>
                        <Input
                          id='totalAmount'
                          type='number'
                          step='0.000001'
                          placeholder='1.5'
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          required
                          className='bg-muted/20'
                        />
                        <Select
                          value={unit}
                          onValueChange={(value) =>
                            setUnit(value as 'ether' | 'gwei' | 'wei')
                          }
                        >
                          <SelectTrigger className='w-full bg-muted/20'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='ether'>ETH</SelectItem>
                            <SelectItem value='gwei'>Gwei</SelectItem>
                            <SelectItem value='wei'>Wei</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='arbiter'>Arbiter Address</Label>
                      <Select
                        value={arbiterAddress}
                        onValueChange={setArbiterAddress}
                        required
                      >
                        <SelectTrigger
                          id='arbiter'
                          className='bg-muted/20 w-full'
                        >
                          <SelectValue placeholder='Select an arbiter' />
                        </SelectTrigger>
                        <SelectContent>
                          {ARBITER_ADDRESS.map((addr) => (
                            <SelectItem key={addr} value={addr}>
                              {addr.slice(0, 10)}...{addr.slice(-8)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className='text-[10px] text-muted-foreground flex items-center gap-1'>
                        <ShieldCheck className='h-3 w-3' />
                        Trusted third-party for dispute resolution
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Milestones */}
              <Card className='border-primary/10 shadow-sm overflow-hidden'>
                <CardHeader className='bg-muted/30 pb-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                        <ListChecks className='h-5 w-5' />
                      </div>
                      <div>
                        <CardTitle className='text-xl'>Milestones</CardTitle>
                        <CardDescription>
                          Break down the project into stages
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleAddMilestone}
                      className='bg-background hover:bg-primary/5 hover:text-primary transition-colors'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Stage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='pt-6 space-y-4'>
                  <AnimatePresence initial={false}>
                    {milestones.map((milestone, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className='relative group p-5 border rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-end'>
                          <div className='md:col-span-1 flex items-center justify-center'>
                            <span className='h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center'>
                              {index + 1}
                            </span>
                          </div>
                          <div className='md:col-span-7 space-y-2'>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                              Deliverable
                            </Label>
                            <Input
                              value={milestone.description}
                              onChange={(e) =>
                                handleMilestoneChange(
                                  index,
                                  'description',
                                  e.target.value,
                                )
                              }
                              placeholder='What will be delivered?'
                              required
                              className='bg-background border-muted'
                            />
                          </div>
                          <div className='md:col-span-3 space-y-2'>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                              Amount ({unit.toUpperCase()})
                            </Label>
                            <Input
                              type='number'
                              step='0.000001'
                              value={milestone.amount}
                              onChange={(e) =>
                                handleMilestoneChange(
                                  index,
                                  'amount',
                                  e.target.value,
                                )
                              }
                              placeholder='0.00'
                              required
                              className='bg-background border-muted'
                            />
                          </div>
                          <div className='md:col-span-1 flex justify-end pb-1'>
                            {milestones.length > 1 && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                                onClick={() => handleRemoveMilestone(index)}
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {sumMilestones !== Number(totalAmount) &&
                    totalAmount !== '' && (
                      <div className='flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium animate-pulse'>
                        <Info className='h-4 w-4' />
                        Total milestones ({sumMilestones} {unit}) must equal
                        total budget ({totalAmount} {unit})
                      </div>
                    )}
                </CardContent>
              </Card>

              <Button
                type='submit'
                className='w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all'
                disabled={
                  isPending ||
                  isConfirming ||
                  isCreatingOffChain ||
                  sumMilestones !== Number(totalAmount)
                }
              >
                {isPending || isConfirming || isCreatingOffChain ? (
                  <>
                    <Loader2 className='w-5 h-5 mr-3 animate-spin' />
                    {isPending
                      ? 'Confirming in Wallet...'
                      : isConfirming
                        ? 'Processing Transaction...'
                        : 'Finalizing Job...'}
                  </>
                ) : (
                  'Launch Project'
                )}
              </Button>
            </form>
          </div>
          <div className='lg:w-96 space-y-6'>
            <div className='sticky top-8'>
              <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2'>
                Live Preview
              </h3>
              <Card className='overflow-hidden border-primary/20 shadow-xl bg-card relative group'>
                <div className='absolute top-0 right-0 p-4 opacity-5'>
                  <Wallet className='h-20 w-20 -rotate-12' />
                </div>

                <CardHeader className='pb-4'>
                  <div className='flex justify-between items-start mb-4'>
                    <Badge
                      variant='outline'
                      className='bg-green-500/10 text-green-600 border-green-500/20'
                    >
                      CREATED
                    </Badge>
                    <Badge variant='secondary' className='text-[10px]'>
                      PREVIEW
                    </Badge>
                  </div>
                  <CardTitle className='text-2xl font-bold line-clamp-2'>
                    {title || 'Your Project Title'}
                  </CardTitle>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <p className='text-sm text-muted-foreground line-clamp-3 leading-relaxed'>
                    {description ||
                      'Your project description will appear here. Be clear and concise to attract the best talent.'}
                  </p>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='p-3 rounded-xl bg-primary/5 border border-primary/10'>
                      <p className='text-[10px] font-bold text-primary uppercase tracking-wider mb-1'>
                        Budget
                      </p>
                      <p className='text-lg font-extrabold'>
                        {totalAmount || '0.0'} {unit.toUpperCase()}
                      </p>
                    </div>
                    <div className='p-3 rounded-xl bg-muted/50 border border-muted'>
                      <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                        Stages
                      </p>
                      <p className='text-lg font-extrabold'>
                        {milestones.length}
                      </p>
                    </div>
                  </div>

                  <Separator className='opacity-50' />

                  <div className='space-y-3'>
                    <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      Milestone Breakdown
                    </p>
                    <div className='space-y-2'>
                      {milestones.slice(0, 3).map((m, i) => (
                        <div key={i} className='flex justify-between text-sm'>
                          <span className='text-muted-foreground truncate max-w-[150px]'>
                            {m.description || `Milestone ${i + 1}`}
                          </span>
                          <span className='font-mono font-medium'>
                            {m.amount || '0'} {unit.toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {milestones.length > 3 && (
                        <p className='text-[10px] text-center text-muted-foreground italic'>
                          + {milestones.length - 3} more stages
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className='bg-muted/30 pt-4'>
                  <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
                    <CheckCircle2 className='h-3 w-3 text-primary' />
                    Funds will be locked in escrow
                  </div>
                </CardFooter>
              </Card>

              <div className='mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4'>
                <h4 className='font-bold flex items-center gap-2 text-primary'>
                  <Info className='h-4 w-4' />
                  Pro Tip
                </h4>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  Breaking your project into 3-5 milestones helps build trust
                  with freelancers and ensures steady progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
