import appCss from '../index.css?url';

import { Toaster } from '@/components/ui/sonner';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { QueryClient } from '@tanstack/react-query';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@onwork/api/routers/index';
import '@rainbow-me/rainbowkit/styles.css';

import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'My App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang='en' className='dark'>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className='grid h-svh grid-rows-[auto_1fr]'>
          <RainbowKitProvider>
            <Outlet />
          </RainbowKitProvider>
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position='bottom-left' />
        <ReactQueryDevtools position='bottom' buttonPosition='bottom-right' />
        <Scripts />
      </body>
    </html>
  );
}
