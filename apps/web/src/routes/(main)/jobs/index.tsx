import { createFileRoute } from '@tanstack/react-router';
import { Calendar, Clock, Wallet, User, Hash } from 'lucide-react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import abi from '@/lib/abi.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const JOB_STATUSES = [
  'Created',
  'Funded',
  'In Progress',
  'Completed',
  'Disputed',
  'Resolved',
  'Cancelled',
];

export const Route = createFileRoute('/(main)/jobs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const dummyJobs = [
    {
      id: 1,
      title: 'Build a DeFi Lending Protocol',
      description:
        'Need an experienced Solidity developer to build a secure lending dApp with flash loans.',
      budget: '5.0 ETH',
      duration: '4 weeks',
      posted: '2 days ago',
    },
    {
      id: 2,
      title: 'React + Wagmi Frontend for NFT Marketplace',
      description:
        'Looking for a frontend dev to integrate minting, listing, and bidding features.',
      budget: '3.2 ETH',
      duration: '3 weeks',
      posted: '5 days ago',
    },
    {
      id: 3,
      title: 'Smart Contract Audit for Token Project',
      description:
        'Full security audit required before mainnet launch. Experience with Slither/MythX preferred.',
      budget: '4.0 ETH',
      duration: '2 weeks',
      posted: '1 week ago',
    },
    {
      id: 4,
      title: 'Design Web3 Dashboard UI',
      description:
        'Create clean, modern dashboard for on-chain analytics tool using Tailwind and Figma.',
      budget: '2.5 ETH',
      duration: '10 days',
      posted: '3 days ago',
    },
    {
      id: 5,
      title: 'Integrate Chainlink Oracles',
      description:
        'Add price feeds and VRF to existing gaming dApp. Must have Chainlink experience.',
      budget: '2.8 ETH',
      duration: '2 weeks',
      posted: '4 days ago',
    },
    {
      id: 6,
      title: 'Write Technical Documentation',
      description:
        'Create clear docs and developer guides for a new layer-2 protocol.',
      budget: '1.8 ETH',
      duration: '1 week',
      posted: '6 days ago',
    },
  ];

  const { data: nextJobId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'nextJobId',
  });

  const { data: jobsList } = useReadContracts({
    contracts: nextJobId
      ? Array.from({ length: Number(nextJobId) }, (_, i) => ({
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'jobs',
          args: [BigInt(i)],
        }))
      : [],
  });

  return (
    <div className='min-h-screen py-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold mb-8'>Open Jobs</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {dummyJobs.map((job) => (
            <div
              key={job.id}
              className='bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow'
            >
              <h2 className='text-xl font-semibold mb-3'>{job.title}</h2>
              <p className='text-muted-foreground text-sm mb-6 line-clamp-3'>
                {job.description}
              </p>

              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <Wallet className='w-4 h-4' />
                  <span className='font-medium'>{job.budget}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='w-4 h-4' />
                  <span>{job.duration}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Calendar className='w-4 h-4' />
                  <span>Posted {job.posted}</span>
                </div>
              </div>

              <button className='mt-6 w-full py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition'>
                View Details
              </button>
            </div>
          ))}
        </div>

        {jobsList && jobsList.length > 0 && (
          <>
            <h2 className='text-3xl font-bold mb-8 mt-12'>On-Chain Jobs</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {jobsList.map((jobResult, index) => {
                if (jobResult.status !== 'success') return null;
                // @ts-ignore
                const [
                  jobId,
                  client,
                  freelancer,
                  arbiter,
                  token,
                  totalAmount,
                  status,
                ] = jobResult.result;

                return (
                  <div
                    key={index}
                    className='bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <h2 className='text-xl font-semibold'>
                        Job #{jobId.toString()}
                      </h2>
                      <span className='px-2 py-1 text-xs bg-primary/10 rounded-full'>
                        {JOB_STATUSES[status] || 'Unknown'}
                      </span>
                    </div>

                    <p className='text-muted-foreground text-sm mb-6'>
                      This job is stored on-chain. Title and description are
                      hashed.
                    </p>

                    <div className='space-y-3'>
                      <div className='flex items-center gap-2 text-sm'>
                        <User className='w-4 h-4' />
                        <span className='font-medium truncate w-full'>
                          Client: {client}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <Wallet className='w-4 h-4' />
                        <span className='font-medium'>
                          {formatUnits(totalAmount, 18)} Tokens
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Hash className='w-4 h-4' />
                        <span className='truncate w-full'>Token: {token}</span>
                      </div>
                    </div>

                    <button className='mt-6 w-full py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition'>
                      View On-Chain Details
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
