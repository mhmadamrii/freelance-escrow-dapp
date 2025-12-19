import { createFileRoute, Link } from '@tanstack/react-router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ShieldCheck, Zap, Globe, Layers, Coins, Lock } from 'lucide-react';

export const Route = createFileRoute('/(public)/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Hero Section */}
      <section className='relative pt-20 pb-32 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background' />

        <div className='container relative z-10 mx-auto px-4 text-center'>
          <div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-fade-in-up'>
            <span className='flex h-2 w-2 rounded-full bg-primary mr-2'></span>
            Live on Sepolia Testnet
          </div>

          <h1 className='text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in-up animation-delay-100'>
            The Future of Freelancing <br /> is{' '}
            <span className='text-primary'>Trustless</span>
          </h1>

          <p className='text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200'>
            Smart contracts ensure you get paid. No middlemen, just code. Secure
            milestone-based payments with any ERC20 token.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300'>
            <Link to='/auth'>
              <button className='w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25'>
                Post a Job
              </button>
            </Link>
            <Link to='/jobs'>
              <button className='w-full sm:w-auto px-8 py-4 text-lg font-semibold border border-border bg-background hover:bg-muted/50 text-foreground rounded-xl transition-all'>
                Find Work
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-12 border-y border-border/50 bg-muted/20'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {[
              { label: 'Total Value Locked', value: '$2.4M+' },
              { label: 'Jobs Completed', value: '1,200+' },
              { label: 'Freelancers', value: '850+' },
              { label: 'Avg. Dispute Rate', value: '< 1%' },
            ].map((stat, i) => (
              <div key={i} className='space-y-2'>
                <h3 className='text-3xl md:text-4xl font-bold text-foreground'>
                  {stat.value}
                </h3>
                <p className='text-sm text-muted-foreground uppercase tracking-wider'>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 px-4'>
        <div className='container mx-auto max-w-6xl'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-bold mb-4'>
              Why Choose EscrowDapp?
            </h2>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
              We combine the flexibility of traditional freelancing platforms
              with the security of blockchain technology.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <FeatureCard
              icon={Lock}
              title='Smart Escrow'
              description="Funds are locked in a smart contract. Clients can't withdraw, freelancers can't run. Money moves only when milestones are met."
            />
            <FeatureCard
              icon={Coins}
              title='Any Token'
              description='Pay and get paid in ETH, USDC, USDT, or your community token. We support all ERC20 standards.'
            />
            <FeatureCard
              icon={ShieldCheck}
              title='Dispute Resolution'
              description='Fair arbitration process built-in. If things go wrong, our decentralized arbiters ensure a fair outcome.'
            />
            <FeatureCard
              icon={Layers}
              title='Milestone Payments'
              description='Break large projects into manageable chunks. Approve and release funds step-by-step.'
            />
            <FeatureCard
              icon={Globe}
              title='Global & Permissionless'
              description='Work with anyone, anywhere. No bank accounts needed. Just connect your wallet and start building.'
            />
            <FeatureCard
              icon={Zap}
              title='Instant Settlement'
              description='No 3-5 day waiting periods. Once work is approved, funds are in your wallet immediately.'
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-24 bg-muted/30'>
        <div className='container mx-auto px-4 max-w-5xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-16'>
            How It Works
          </h2>

          <div className='relative'>
            {/* Connecting Line (Desktop) */}
            <div className='hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0' />

            <div className='grid md:grid-cols-3 gap-12 relative z-10'>
              <StepCard
                number='01'
                title='Create & Fund'
                description='Client posts a job and deposits funds into the secure escrow smart contract.'
              />
              <StepCard
                number='02'
                title='Work & Submit'
                description='Freelancer completes milestones and submits proof of work on-chain.'
              />
              <StepCard
                number='03'
                title='Approve & Pay'
                description='Client reviews the work. Once approved, the contract releases funds instantly.'
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-32 px-4 text-center'>
        <div className='container mx-auto max-w-3xl bg-linear-to-br from-primary/10 to-transparent p-12 rounded-3xl border border-primary/20'>
          <h2 className='text-4xl font-bold mb-6'>Ready to Start Building?</h2>
          <p className='text-xl text-muted-foreground mb-10'>
            Join the decentralized workforce today. Secure, transparent, and
            fair for everyone.
          </p>
          <div className='flex justify-center'>
            <ConnectButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border py-12 bg-muted/10'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-4 gap-8 mb-12'>
            <div className='col-span-2'>
              <div className='flex items-center gap-2 font-bold text-xl mb-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <ShieldCheck className='h-5 w-5' />
                </div>
                <span>EscrowDapp</span>
              </div>
              <p className='text-muted-foreground max-w-xs'>
                The world's most secure decentralized freelancing platform.
                Built for the future of work.
              </p>
            </div>

            <div>
              <h4 className='font-semibold mb-4'>Platform</h4>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <Link to='/jobs' className='hover:text-foreground'>
                    Find Work
                  </Link>
                </li>
                <li>
                  <Link to='/jobs/create' className='hover:text-foreground'>
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link to='/dashboard' className='hover:text-foreground'>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold mb-4'>Legal</h4>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a href='#' className='hover:text-foreground'>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-foreground'>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-foreground'>
                    Smart Contract
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground'>
            <p>© 2024 EscrowDapp. All rights reserved.</p>
            <div className='flex gap-6'>
              <a href='#' className='hover:text-foreground'>
                Twitter
              </a>
              <a href='#' className='hover:text-foreground'>
                GitHub
              </a>
              <a href='#' className='hover:text-foreground'>
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className='p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md'>
      <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4'>
        <Icon className='h-6 w-6' />
      </div>
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='text-muted-foreground'>{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className='bg-background p-8 rounded-2xl border border-border relative'>
      <div className='text-6xl font-bold text-muted/20 absolute top-4 right-6 select-none'>
        {number}
      </div>
      <h3 className='text-2xl font-bold mb-4 relative z-10'>{title}</h3>
      <p className='text-muted-foreground relative z-10'>{description}</p>
    </div>
  );
}
