import * as z from 'zod';
import prisma from '@onwork/db';

import { protectedProcedure, router } from '..';

export const jobRouter = router({
  allJobs: protectedProcedure.query(({}) => {
    return prisma.job.findMany({
      include: {
        milestones: true,
      },
    });
  }),
  createJobApplication: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        coverLetter: z.string(),
        freelancerWallet: z.string(),
      }),
    )
    .mutation(({ input }) => {
      return prisma.jobApplication.create({
        data: {
          coverLetter: input.coverLetter,
          jobId: input.jobId,
          freelancerWallet: input.freelancerWallet,
        },
      });
    }),
  jobById: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(({ input }) => {
      return prisma.job.findUnique({
        where: {
          id: input.jobId,
        },
        include: {
          milestones: true,
          reviews: true,
          jobApplications: true,
        },
      });
    }),
  deleteJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.job.delete({
        where: {
          id: input.jobId,
        },
      });
    }),
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
          // onChainId: BigInt(input.onChainId),
          onChainId: Number(input.onChainId),
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
