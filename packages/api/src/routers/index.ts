import { publicProcedure, router } from '../index';
import { jobRouter } from './job';
import { milestoneRouter } from './milestone';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  job: jobRouter,
  milestone: milestoneRouter,
});
export type AppRouter = typeof appRouter;
