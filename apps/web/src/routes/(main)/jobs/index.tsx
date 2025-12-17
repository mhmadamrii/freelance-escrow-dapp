import { createFileRoute } from '@tanstack/react-router';
import { Calendar, Clock, Wallet } from 'lucide-react';

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
      </div>
    </div>
  );
}
