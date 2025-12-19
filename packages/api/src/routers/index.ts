import { protectedProcedure, publicProcedure, router } from '../index';
import { jobRouter } from './job';
import { milestoneRouter } from './milestone';
import { userRouter } from './user';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  privateData: protectedProcedure.query(() => {
    return {
      status: 'OK',
      data: 'this is a private data',
    };
  }),
  job: jobRouter,
  milestone: milestoneRouter,
  user: userRouter,
});
export type AppRouter = typeof appRouter;
