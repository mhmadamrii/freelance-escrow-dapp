import { Link } from '@tanstack/react-router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Briefcase, Search, LayoutDashboard, ShieldCheck } from 'lucide-react';

export function Header() {
  const links = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: null,
    },
    {
      to: '/jobs',
      label: 'Find Work',
      icon: Search,
    },
    {
      to: '/jobs/create',
      label: 'Post a Job',
      icon: Briefcase,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: LayoutDashboard,
    },
  ] as const;

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8'>
        <div className='flex items-center gap-2'>
          <Link to='/' className='flex items-center gap-2 font-bold text-xl'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <ShieldCheck className='h-5 w-5' />
            </div>
            <span>OnWork</span>
          </Link>
        </div>

        <nav className='hidden md:flex items-center gap-6 text-sm font-medium'>
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className='flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground'
            >
              {Icon && <Icon className='h-4 w-4' />}
              {label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-4'>
          <ConnectButton
            showBalance={false}
            accountStatus='address'
            chainStatus='icon'
          />
        </div>
      </div>
    </header>
  );
}
