import { createFileRoute, Link } from '@tanstack/react-router';
import { useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Star } from 'lucide-react';

const ACC_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

export const Route = createFileRoute('/(public)/')({
  component: RouteComponent,
});

function RouteComponent() {
  const balance = useBalance({
    address: ACC_ADDRESS,
  });

  console.log('balance', balance.data);
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='py-20 px-6 text-center'>
        <h1 className='text-5xl md:text-6xl font-bold mb-6'>
          Hire Top Talent with Crypto Escrow
        </h1>
        <p className='text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12'>
          Secure, milestone-based payments on-chain. No middlemen. Work gets
          done, funds get released — automatically.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link to='/jobs/create'>
            <button className='px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-lg'>
              Post a Job
            </button>
          </Link>
          <Link to='/jobs'>
            <button className='px-8 py-4 text-lg font-semibold border border-primary text-primary rounded-lg'>
              Find Work
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Freelancers Section */}
      <section className='py-16 px-6 bg-muted/50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12'>
            Top Freelancers
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Freelancer 1 */}
            <div className='bg-card p-6 rounded-xl shadow-lg'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-16 h-16 bg-gray-200 border-2 border-dashed rounded-full' />
                <div>
                  <h3 className='text-xl font-semibold'>Alex Rivera</h3>
                  <p className='text-muted-foreground'>
                    Smart Contract Developer
                  </p>
                </div>
              </div>
              <p className='text-sm mb-4 line-clamp-3'>
                Solidity expert with 4+ years building DeFi and NFT projects.
                Delivered 50+ secure contracts.
              </p>
              <div className='flex items-center gap-1 mb-2'>
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <span className='ml-2 font-medium'>5.0</span>
                <span className='text-muted-foreground'>(32 reviews)</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Solidity
                </span>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Hardhat
                </span>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Web3.js
                </span>
              </div>
            </div>

            {/* Freelancer 2 */}
            <div className='bg-card p-6 rounded-xl shadow-lg'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-16 h-16 bg-gray-200 border-2 border-dashed rounded-full' />
                <div>
                  <h3 className='text-xl font-semibold'>Sarah Chen</h3>
                  <p className='text-muted-foreground'>
                    Full-Stack Blockchain Developer
                  </p>
                </div>
              </div>
              <p className='text-sm mb-4 line-clamp-3'>
                React + Wagmi specialist. Built 20+ dApps with escrow and token
                integrations.
              </p>
              <div className='flex items-center gap-1 mb-2'>
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-gray-300 text-gray-300' />
                <span className='ml-2 font-medium'>4.9</span>
                <span className='text-muted-foreground'>(28 reviews)</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  React
                </span>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Wagmi
                </span>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  TypeScript
                </span>
              </div>
            </div>

            {/* Freelancer 3 */}
            <div className='bg-card p-6 rounded-xl shadow-lg'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-16 h-16 bg-gray-200 border-2 border-dashed rounded-full' />
                <div>
                  <h3 className='text-xl font-semibold'>Marcus Okoye</h3>
                  <p className='text-muted-foreground'>
                    UI/UX Designer for Web3
                  </p>
                </div>
              </div>
              <p className='text-sm mb-4 line-clamp-3'>
                Crafting intuitive interfaces for decentralized apps. Portfolio
                includes top DeFi platforms.
              </p>
              <div className='flex items-center gap-1 mb-2'>
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <Star className='w-5 h-5 fill-yellow-500 text-yellow-500' />
                <span className='ml-2 font-medium'>5.0</span>
                <span className='text-muted-foreground'>(19 reviews)</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Figma
                </span>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Tailwind
                </span>
                <span className='px-3 py-1 text-xs bg-primary/10 rounded-full'>
                  Web3 UX
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-20 px-6 text-center'>
        <h2 className='text-3xl md:text-4xl font-bold mb-6'>
          Ready to Get Started?
        </h2>
        <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
          Join thousands of clients and freelancers using secure on-chain
          escrow.
        </p>
        <button className='px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-lg'>
          Connect Wallet
        </button>
        <ConnectButton />
      </section>
    </div>
  );
}
