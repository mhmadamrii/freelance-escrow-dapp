import prisma, { UserRole } from '@onwork/db';
import { z } from 'zod';
import { protectedProcedure, router } from '..';

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),
  applyAsFreelancer: protectedProcedure
    .input(z.object({ walletAddress: z.string().optional() }))
    .mutation(({ ctx, input }) => {
      return prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          role: 'FREELANCER',
          walletAddress: input.walletAddress,
        },
      });
    }),
  linkWallet: protectedProcedure
    .input(z.object({ walletAddress: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          walletAddress: input.walletAddress,
        },
      });
    }),
});
