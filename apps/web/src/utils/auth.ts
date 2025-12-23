import { auth } from '@onwork/auth';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const getUser = createServerFn({ method: 'GET' }).handler(
  async ({ context }) => {
    const { headers } = getRequest();
    const session = await auth.api.getSession({ headers });

    return session?.user || null;
  },
);
