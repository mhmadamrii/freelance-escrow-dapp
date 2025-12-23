import { createFileRoute, Link } from '@tanstack/react-router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Coins,
  Lock,
  ArrowRight,
  Github,
  Twitter,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'motion/react';
import SpotlightCard from '@/components/react-bits/SpotlightCard';
import ShinyText from '@/components/react-bits/ShinyText';
import DecryptedText from '@/components/react-bits/DecryptedText';
import SplitText from '@/components/react-bits/SplitText';
import CountUp from '@/components/react-bits/CountUp';

export const Route = createFileRoute('/(public)/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className='min-h-screen bg-[#030303] text-white selection:bg-primary/30'>
      {/* Background Elements */}
      <div className='fixed inset-0 z-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]' />
        <div className='absolute inset-0 bg-[url("https://grainy-gradients.vercel.app/noise.svg")] opacity-20 brightness-100 contrast-150' />
      </div>

      {/* Hero Section */}
      <section className='relative pt-32 pb-20 overflow-hidden z-10'>
        <div className='container mx-auto px-4 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-md'
          >
            <span className='flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse'></span>
            <ShinyText text='Live on Sepolia Testnet' speed={3} />
          </motion.div>

          <div className='max-w-4xl mx-auto mb-8'>
            <SplitText
              text='The Future of Freelancing is'
              className='text-5xl md:text-8xl font-bold tracking-tight justify-center leading-tight'
            />
            <div className='text-5xl md:text-8xl font-bold tracking-tight text-primary mt-2'>
              <DecryptedText
                text='Trustless'
                speed={80}
                maxIterations={15}
                animateOn='view'
              />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed'
          >
            Smart contracts ensure you get paid. No middlemen, just code. Secure
            milestone-based payments with any ERC20 token.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className='flex flex-col sm:flex-row gap-6 justify-center items-center'
          >
            <Link to='/auth'>
              <button className='group relative px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]'>
                <span className='flex items-center gap-2'>
                  Get Started{' '}
                  <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
                </span>
              </button>
            </Link>
            <Link to='/jobs'>
              <button className='px-8 py-4 text-lg font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all backdrop-blur-md'>
                Explore Jobs
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-20 relative z-10'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-12'>
            {[
              {
                label: 'Total Value Locked',
                value: 2400000,
                prefix: '$',
                suffix: '+',
              },
              { label: 'Jobs Completed', value: 1200, suffix: '+' },
              { label: 'Freelancers', value: 850, suffix: '+' },
              { label: 'Dispute Rate', value: 1, prefix: '< ', suffix: '%' },
            ].map((stat, i) => (
              <div key={i} className='text-center group'>
                <div className='text-4xl md:text-5xl font-bold mb-2 bg-linear-to-b from-white to-gray-500 bg-clip-text text-transparent'>
                  <CountUp
                    to={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <p className='text-sm text-gray-500 uppercase tracking-[0.2em] font-medium'>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-32 relative z-10'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-20'>
            <h2 className='text-4xl md:text-6xl font-bold mb-6'>
              Built for the <span className='text-primary'>New Economy</span>
            </h2>
            <p className='text-gray-400 text-xl max-w-2xl mx-auto'>
              Decentralized infrastructure that puts power back in the hands of
              creators.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-6'>
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
      <section className='py-32 relative z-10 bg-white/2 border-y border-white/5'>
        <div className='container mx-auto px-4'>
          <h2 className='text-4xl md:text-5xl font-bold text-center mb-20'>
            The Workflow
          </h2>

          <div className='grid md:grid-cols-3 gap-12'>
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
      </section>

      {/* CTA Section */}
      <section className='py-40 relative z-10'>
        <div className='container mx-auto px-4'>
          <SpotlightCard className='max-w-5xl mx-auto text-center py-20 bg-primary/5 border-primary/20'>
            <h2 className='text-5xl font-bold mb-8'>
              Ready to Start Building?
            </h2>
            <p className='text-2xl text-gray-400 mb-12 max-w-2xl mx-auto'>
              Join the decentralized workforce today. Secure, transparent, and
              fair for everyone.
            </p>
            <div className='flex justify-center scale-125'>
              <ConnectButton />
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-white/5 py-20 relative z-10 bg-black'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-4 gap-12 mb-20'>
            <div className='col-span-2'>
              <div className='flex items-center gap-2 font-bold text-2xl mb-6'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
                  <ShieldCheck className='h-6 w-6' />
                </div>
                <span>OnWork</span>
              </div>
              <p className='text-gray-500 text-lg max-w-xs leading-relaxed'>
                The world's most secure decentralized freelancing platform.
                Built for the future of work.
              </p>
            </div>

            <div>
              <h4 className='font-bold text-white mb-6 uppercase tracking-widest text-sm'>
                Platform
              </h4>
              <ul className='space-y-4 text-gray-500'>
                <li>
                  <Link
                    to='/jobs'
                    className='hover:text-primary transition-colors'
                  >
                    Find Work
                  </Link>
                </li>
                <li>
                  <Link
                    to='/jobs/create'
                    className='hover:text-primary transition-colors'
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    to='/dashboard'
                    className='hover:text-primary transition-colors'
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold text-white mb-6 uppercase tracking-widest text-sm'>
                Connect
              </h4>
              <div className='flex gap-4'>
                <a
                  href='#'
                  className='h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-white/10'
                >
                  <Twitter className='h-5 w-5' />
                </a>
                <a
                  href='#'
                  className='h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-white/10'
                >
                  <Github className='h-5 w-5' />
                </a>
                <a
                  href='#'
                  className='h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-white/10'
                >
                  <MessageSquare className='h-5 w-5' />
                </a>
              </div>
            </div>
          </div>

          <div className='pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm'>
            <p>© 2024 OnWork. All rights reserved.</p>
            <div className='flex gap-8'>
              <a href='#' className='hover:text-white transition-colors'>
                Terms
              </a>
              <a href='#' className='hover:text-white transition-colors'>
                Privacy
              </a>
              <a href='#' className='hover:text-white transition-colors'>
                Contract
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
    <SpotlightCard className='group'>
      <div className='h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform'>
        <Icon className='h-7 w-7' />
      </div>
      <h3 className='text-2xl font-bold mb-4'>{title}</h3>
      <p className='text-gray-400 leading-relaxed'>{description}</p>
    </SpotlightCard>
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
    <div className='relative p-10 rounded-3xl bg-white/3 border border-white/5 group hover:border-primary/30 transition-all'>
      <div className='text-8xl font-black text-white/2 absolute top-4 right-8 select-none group-hover:text-primary/5 transition-colors'>
        {number}
      </div>
      <div className='relative z-10'>
        <div className='text-primary font-mono mb-4'>Step {number}</div>
        <h3 className='text-3xl font-bold mb-6'>{title}</h3>
        <p className='text-gray-400 text-lg leading-relaxed'>{description}</p>
      </div>
    </div>
  );
}
