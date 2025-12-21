import * as z from 'zod';
import prisma from '@onwork/db';

import type { AppRouter } from '.';
import type { inferRouterOutputs } from '@trpc/server';

import { protectedProcedure, router } from '..';

export const jobRouter = router({
  allJobs: protectedProcedure.query(({}) => {
    return prisma.job.findMany({
      include: {
        milestones: true,
        jobApplications: true,
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
  updateJobStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z.enum([
          'WAITING_FUNDING',
          'FUNDED',
          'IN_PROGRESS',
          'COMPLETED',
          'DISPUTED',
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.job.update({
        where: {
          id: input.jobId,
        },
        data: {
          status: input.status,
        },
      });
    }),
  assignFreelancerWalletToJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        applicationId: z.string(),
        freelancerWallet: z.string(),
      }),
    )
    .mutation(({ input }) => {
      return prisma.$transaction([
        prisma.job.update({
          where: { id: input.jobId },
          data: {
            freelancerWallet: input.freelancerWallet,
            status: 'WAITING_FUNDING',
          },
        }),

        prisma.jobApplication.update({
          where: {
            id: input.applicationId,
          },
          data: {
            status: 'ACCEPTED',
          },
        }),
      ]);
    }),
  updateMilestones: protectedProcedure
    .input(
      z.object({
        milestoneId: z.string(),
        status: z.enum(['IN_PROGRESS', 'COMPLETED', 'SUBMITTED']),
      }),
    )
    .mutation(({ input }) => {
      return prisma.milestone.update({
        where: {
          id: input.milestoneId,
        },
        data: {
          status: input.status,
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
    .mutation(({ input }) => {
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
    .mutation(async ({ input }) => {
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
  getMilestonesByJobId: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(({ input }) => {
      return prisma.job.findFirst({
        where: {
          id: input.jobId,
        },
        include: {
          milestones: true,
        },
      });
    }),
});

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type JobByIdOutput = RouterOutputs['job']['jobById'];
