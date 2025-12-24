import * as z from 'zod';
import prisma from '@onwork/db';

import type { AppRouter } from '.';
import type { inferRouterOutputs } from '@trpc/server';

import { protectedProcedure, publicProcedure, router } from '..';

export const jobRouter = router({
  allJobs: protectedProcedure.query(({}) => {
    return prisma.job.findMany({
      include: {
        milestones: true,
        jobApplications: true,
        user: true,
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
          'RESOLVED',
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
    .mutation(async ({ input }) => {
      const milestone = await prisma.milestone.findUnique({
        where: { id: input.milestoneId },
        include: { job: true },
      });

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      return await prisma.$transaction(async (tx) => {
        const updatedMilestone = await tx.milestone.update({
          where: { id: input.milestoneId },
          data: {
            status: input.status,
          },
        });

        if (input.status === 'COMPLETED' && milestone.status !== 'COMPLETED') {
          // Update client totalSpent
          await tx.user.update({
            where: { id: milestone.job.userId },
            data: {
              totalSpent: {
                increment: milestone.amount,
              },
            },
          });

          // Update freelancer totalEarned
          if (milestone.job.freelancerWallet) {
            const freelancer = await tx.user.findFirst({
              where: { walletAddress: milestone.job.freelancerWallet },
            });

            if (freelancer) {
              await tx.user.update({
                where: { id: freelancer.id },
                data: {
                  totalEarned: {
                    increment: milestone.amount,
                  },
                },
              });
            }
          }
        }

        return updatedMilestone;
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
          user: true,
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
        category: z.enum([
          'ANY',
          'WEB2_DEVELOPMENT',
          'WEB3_DEVELOPMENT',
          'SECURITY',
          'DEFI',
          'NFT',
          'OTHER',
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.job.create({
        data: {
          userId: ctx.session.user.id,
          onChainId: Number(input.onChainId),
          jobHash: input.jobHash,
          status: 'CREATED',
          clientWallet: input.clientWallet,
          arbiter: input.arbiter,
          tokenAddress: input.tokenAddress,
          totalAmount: input.totalAmount,
          title: input.title,
          description: input.description,
          category: input.category,
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
  getMyJobs: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    return prisma.job.findMany({
      where: {
        OR: [
          { userId: ctx.session.user.id },
          ...(user?.walletAddress
            ? [{ freelancerWallet: user.walletAddress }]
            : []),
        ],
      },
      include: {
        milestones: true,
        jobApplications: true,
        user: true,
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),
  getArbiterJobs: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user?.walletAddress) return [];

    return prisma.job.findMany({
      where: {
        arbiter: {
          equals: user.walletAddress,
          mode: 'insensitive',
        },
        status: 'DISPUTED',
      },
      include: {
        milestones: true,
        user: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),
  getExplorerData: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        type: z.enum(['ALL', 'JOBS', 'MILESTONES']).default('ALL'),
      }),
    )
    .query(async ({ input }) => {
      const { query, type } = input;

      const jobs =
        type === 'ALL' || type === 'JOBS'
          ? await prisma.job.findMany({
              where: query
                ? {
                    OR: [
                      { title: { contains: query, mode: 'insensitive' } },
                      { description: { contains: query, mode: 'insensitive' } },
                      {
                        clientWallet: { contains: query, mode: 'insensitive' },
                      },
                      { jobHash: { contains: query, mode: 'insensitive' } },
                    ],
                  }
                : {},
              include: {
                user: true,
                milestones: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            })
          : [];

      const milestones =
        type === 'ALL' || type === 'MILESTONES'
          ? await prisma.milestone.findMany({
              where: query
                ? {
                    OR: [
                      { description: { contains: query, mode: 'insensitive' } },
                      {
                        descriptionHash: {
                          contains: query,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  }
                : {},
              include: {
                job: {
                  include: {
                    user: true,
                  },
                },
              },
              orderBy: { updatedAt: 'desc' },
              take: 20,
            })
          : [];

      return {
        jobs,
        milestones,
      };
    }),
  getDisputeStats: publicProcedure.query(async () => {
    const [disputedCount, resolvedCount] = await Promise.all([
      prisma.job.count({ where: { status: 'DISPUTED' } }),
      prisma.job.count({ where: { status: 'RESOLVED' } }),
    ]);

    return {
      disputedCount,
      resolvedCount,
    };
  }),
});

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type JobByIdOutput = RouterOutputs['job']['jobById'];
export type MyJobsOutput = RouterOutputs['job']['getMyJobs'];
export type ExplorerOutput = RouterOutputs['job']['getExplorerData'];
