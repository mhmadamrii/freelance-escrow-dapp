import prisma from '@onwork/db';
import { protectedProcedure, router } from '..';

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),
  applyAsFreelancer: protectedProcedure.mutation(({ ctx }) => {
    return prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        role: 'FREELANCER',
      },
    });
  }),
});
