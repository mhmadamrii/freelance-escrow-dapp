import { createFileRoute } from '@tanstack/react-router';
import { useTRPC } from '@/utils/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { formatEther, parseEther } from 'viem';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { FREELANCE_ESCROW_ADDRESS, ARBITER_ADDRESS } from '@/lib/constants';
import abi from '@/lib/abi.json';
import {
  AlertCircle,
  CheckCircle2,
  Gavel,
  Loader2,
  Scale,
  Shield,
  Users,
  History,
} from 'lucide-react';
import { motion } from 'motion/react';

export const Route = createFileRoute('/(main)/arbiter/')({
  component: ArbiterPage,
});

function ArbiterPage() {
  const { address } = useAccount();
  const trpc = useTRPC();

  const isArbiter = useMemo(() => {
    if (!address) return false;
    return ARBITER_ADDRESS.some(
      (addr) => addr.toLowerCase() === address.toLowerCase(),
    );
  }, [address]);

  const {
    data: disputedJobs,
    isLoading: isLoadingJobs,
    refetch,
  } = useQuery(
    trpc.job.getArbiterJobs.queryOptions(undefined, { enabled: isArbiter }),
  );

  const { data: stats, isLoading: isLoadingStats } = useQuery(
    trpc.job.getDisputeStats.queryOptions(undefined, { enabled: !isArbiter }),
  );

  if (isLoadingJobs || isLoadingStats) {
    return (
      <div className='h-[calc(100vh-80px)] flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!isArbiter) {
    return (
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12'>
        {/* Public Header */}
        <div className='text-center space-y-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium'
          >
            <Shield className='h-4 w-4' />
            Platform Governance
          </motion.div>
          <h1 className='text-4xl md:text-5xl font-bold tracking-tight'>
            Arbiter Network
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Ensuring fairness and trust in every decentralized transaction.
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid md:grid-cols-3 gap-6'>
          <Card className='bg-gradient-to-br from-primary/5 to-transparent border-primary/10'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                  <AlertCircle className='h-6 w-6' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>
                    {stats?.disputedCount || 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Active Disputes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-gradient-to-br from-green-500/5 to-transparent border-green-500/10'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600'>
                  <CheckCircle2 className='h-6 w-6' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>
                    {stats?.resolvedCount || 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Cases Resolved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600'>
                  <Users className='h-6 w-6' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>
                    {ARBITER_ADDRESS.length}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Active Arbiters
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arbiter Bio Section */}
        <div className='grid lg:grid-cols-2 gap-12 items-center pt-8'>
          <div className='space-y-6'>
            <h2 className='text-3xl font-bold'>The Arbiter's Role</h2>
            <p className='text-muted-foreground leading-relaxed'>
              Arbiters are trusted community members or automated protocols
              responsible for resolving disputes when a client and freelancer
              cannot agree on milestone completion. They review evidence
              submitted by both parties and distribute the escrowed funds
              fairly.
            </p>
            <div className='space-y-4'>
              <div className='flex gap-4'>
                <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                  <Gavel className='h-5 w-5' />
                </div>
                <div>
                  <h4 className='font-semibold'>Impartial Judgment</h4>
                  <p className='text-sm text-muted-foreground'>
                    Decisions are based strictly on the agreed-upon job
                    description and submitted work.
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                  <History className='h-5 w-5' />
                </div>
                <div>
                  <h4 className='font-semibold'>Transparent History</h4>
                  <p className='text-sm text-muted-foreground'>
                    Every resolution is recorded on-chain, building a reputation
                    of fairness for the arbiter.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Card className='relative overflow-hidden border-2'>
            <div className='absolute top-0 right-0 p-4'>
              <Badge
                variant='secondary'
                className='bg-primary/10 text-primary border-none'
              >
                Featured Arbiter
              </Badge>
            </div>
            <CardHeader className='pb-2'>
              <div className='flex items-center gap-4'>
                <div className='h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold'>
                  JD
                </div>
                <div>
                  <CardTitle>Justice DAO</CardTitle>
                  <CardDescription>
                    Decentralized Arbitration Council
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm'>
                "Our mission is to provide a neutral, decentralized layer for
                the global freelance economy. We've handled over 150+ complex
                disputes across various Web3 domains."
              </p>
              <div className='grid grid-cols-2 gap-4 pt-2'>
                <div className='p-3 rounded-lg bg-muted/50 text-center'>
                  <div className='text-lg font-bold'>98%</div>
                  <div className='text-[10px] uppercase tracking-wider text-muted-foreground'>
                    Satisfaction
                  </div>
                </div>
                <div className='p-3 rounded-lg bg-muted/50 text-center'>
                  <div className='text-lg font-bold'>24h</div>
                  <div className='text-[10px] uppercase tracking-wider text-muted-foreground'>
                    Avg. Resolution
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
            <Gavel className='h-6 w-6 text-primary' />
          </div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Arbiter Dashboard
          </h1>
        </div>
        <p className='text-muted-foreground'>
          Review and resolve active disputes on the platform.
        </p>
      </div>

      {!disputedJobs || disputedJobs.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4'>
              <Scale className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold'>No Active Disputes</h3>
            <p className='text-muted-foreground max-w-sm'>
              You don't have any pending disputes to resolve at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6'>
          {disputedJobs.map((job) => (
            <DisputeCard key={job.id} job={job} onResolved={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function DisputeCard({
  job,
  onResolved,
}: {
  job: any;
  onResolved: () => void;
}) {
  const trpc = useTRPC();
  const [clientRefund, setClientRefund] = useState('');
  const [freelancerPayment, setFreelancerPayment] = useState('');
  const {
    writeContract,
    data: hash,
    isPending: isContractPending,
  } = useWriteContract();

  const updateStatus = useMutation(trpc.job.updateJobStatus.mutationOptions());

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const totalAmount = Number(formatEther(BigInt(job.totalAmount.toString())));

  const handleResolve = async () => {
    if (!clientRefund || !freelancerPayment) {
      toast.error('Please specify both refund and payment amounts');
      return;
    }

    const refund = Number(clientRefund);
    const payment = Number(freelancerPayment);

    if (Math.abs(refund + payment - totalAmount) > 0.000001) {
      toast.error(`Total must equal the job amount: ${totalAmount} ETH`);
      return;
    }

    if (!job.onChainId) {
      toast.error('On-chain ID not found for this job');
      return;
    }

    try {
      writeContract({
        address: FREELANCE_ESCROW_ADDRESS as `0x${string}`,
        abi,
        functionName: 'resolveDispute',
        args: [
          BigInt(job.onChainId),
          parseEther(clientRefund),
          parseEther(freelancerPayment),
        ],
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve dispute');
    }
  };

  // Update DB status after contract success
  if (
    hash &&
    !isConfirming &&
    !updateStatus.isPending &&
    job.status !== 'RESOLVED'
  ) {
    updateStatus.mutate(
      {
        jobId: job.id,
        status: 'RESOLVED',
      },
      {
        onSuccess: () => {
          toast.success('Dispute resolved successfully!');
          onResolved();
        },
      },
    );
  }

  const isResolving =
    isContractPending || isConfirming || updateStatus.isPending;

  return (
    <Card className='overflow-hidden border-2 hover:border-primary/20 transition-colors'>
      <CardHeader className='bg-muted/30 pb-4'>
        <div className='flex justify-between items-start'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='bg-orange-500/10 text-orange-600 border-orange-200'
              >
                Disputed
              </Badge>
              <span className='text-xs text-muted-foreground'>
                ID: {job.onChainId}
              </span>
            </div>
            <CardTitle className='text-xl'>{job.title}</CardTitle>
            <CardDescription className='line-clamp-2'>
              {job.description}
            </CardDescription>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-primary'>
              {totalAmount} ETH
            </div>
            <div className='text-xs text-muted-foreground'>Total Escrowed</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid md:grid-cols-2 gap-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <AlertCircle className='h-4 w-4 text-orange-500' />
              Dispute Details
            </div>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div className='p-3 rounded-lg bg-muted/50'>
                <div className='text-muted-foreground mb-1'>Client</div>
                <div className='font-mono text-xs truncate'>
                  {job.clientWallet}
                </div>
              </div>
              <div className='p-3 rounded-lg bg-muted/50'>
                <div className='text-muted-foreground mb-1'>Freelancer</div>
                <div className='font-mono text-xs truncate'>
                  {job.freelancerWallet}
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='text-sm font-medium'>Milestones</div>
              <div className='space-y-2'>
                {job.milestones.map((m: any, i: number) => (
                  <div
                    key={i}
                    className='flex items-center justify-between text-xs p-2 border rounded'
                  >
                    <span>{m.description || `Milestone ${i + 1}`}</span>
                    <span className='font-medium'>
                      {formatEther(BigInt(m.amount.toString()))} ETH
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='space-y-6 p-6 rounded-xl bg-primary/5 border border-primary/10'>
            <div className='flex items-center gap-2 text-sm font-medium text-primary'>
              <Scale className='h-4 w-4' />
              Resolution Proposal
            </div>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor={`refund-${job.id}`}>
                  Refund to Client (ETH)
                </Label>
                <Input
                  id={`refund-${job.id}`}
                  type='number'
                  step='0.001'
                  placeholder='0.00'
                  value={clientRefund}
                  onChange={(e) => setClientRefund(e.target.value)}
                  disabled={isResolving}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`payment-${job.id}`}>
                  Payment to Freelancer (ETH)
                </Label>
                <Input
                  id={`payment-${job.id}`}
                  type='number'
                  step='0.001'
                  placeholder='0.00'
                  value={freelancerPayment}
                  onChange={(e) => setFreelancerPayment(e.target.value)}
                  disabled={isResolving}
                />
              </div>
              <div className='pt-2'>
                <Button
                  className='w-full'
                  onClick={handleResolve}
                  disabled={isResolving}
                >
                  {isResolving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {isConfirming ? 'Confirming...' : 'Resolving...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='mr-2 h-4 w-4' />
                      Resolve Dispute
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
