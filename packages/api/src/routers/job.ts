import * as z from 'zod';
import prisma from '@onwork/db';

import { protectedProcedure, router } from '..';

export const jobRouter = router({
  createJob: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        jobHash: z.string(),
        onChainId: z.string(),
        clientWallet: z.string(),
        arbiter: z.string(),
        tokenAddress: z.string().optional(),
        totalAmount: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.job.create({
        data: {
          onChainId: BigInt(input.onChainId),
          jobHash: input.jobHash,
          status: 'CREATED',
          clientWallet: input.clientWallet,
          arbiter: input.arbiter,
          tokenAddress: input.tokenAddress,
          totalAmount: input.totalAmount,
          title: input.title,
          description: input.description,
        },
      });
    }),
});
