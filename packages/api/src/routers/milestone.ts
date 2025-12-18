import prisma from '@onwork/db';
import z from 'zod';

import { protectedProcedure } from '..';

export const milestoneRouter = {
  createMilestones: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),

        // must come from confirmed on-chain calldata / event
        milestones: z.array(
          z.object({
            amount: z.string(), // wei
            descriptionHash: z.string(), // bytes32
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.milestone.createMany({
        data: input.milestones.map((m, index) => ({
          jobId: input.jobId,
          onChainIndex: index,
          amount: m.amount,
          descriptionHash: m.descriptionHash,
        })),
        skipDuplicates: true, // protects against replays / retries
      });
    }),
};
