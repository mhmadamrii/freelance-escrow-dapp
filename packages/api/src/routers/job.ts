import * as z from 'zod';

import { publicProcedure } from '..';
import prisma from '@onwork/db';

export const jobRouter = {
  createJob: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        requirements: z.string().optional(),
        budget: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.job.create({
        data: {
          title: input.title,
          description: input.description,
          requirements: input.requirements,
          budget: input.budget,
        },
      });
    }),
};
