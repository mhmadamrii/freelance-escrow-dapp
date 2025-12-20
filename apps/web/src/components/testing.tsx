import abi from '@/lib/abi.json';

import { useReadContract, useReadContracts } from 'wagmi';
import { useMemo } from 'react';

const CONTRACT_CONFIG = {
  address: '0xYourContractAddress' as const,
  abi: abi, // Your contract ABI
};

export function JobList() {
  // 1. Get the total number of jobs
  const { data: nextJobId } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'nextJobId',
  });

  // 2. Prepare the batch of calls
  const jobCalls = useMemo(() => {
    if (!nextJobId) return [];

    // Create an array [0, 1, 2, ... nextJobId - 1]
    const count = Number(nextJobId);
    return Array.from({ length: count }, (_, i) => ({
      ...CONTRACT_CONFIG,
      functionName: 'jobs',
      args: [BigInt(i)],
    }));
  }, [nextJobId]);

  // 3. Fetch all jobs in one go
  const { data: jobsResult, isLoading } = useReadContracts({
    contracts: jobCalls,
    query: {
      enabled: jobCalls.length > 0,
    },
  });

  if (isLoading) return <div>Loading jobs...</div>;

  return (
    <div>
      {jobsResult?.map((result, index) => {
        const job = result.result; // Struct data is here
        if (!job) return null;

        // job is an array/object depending on your ABI/wagmi version
        // Based on your struct: [jobId, client, freelancer, arbiter, token, totalAmount, status, ...]
        return (
          <div key={index} className='job-card'>
            <h3>Job #{index}</h3>
            <p>Amount: {job[5].toString()} (in wei/tokens)</p>
            <p>Status: {job[6]}</p>
          </div>
        );
      })}
    </div>
  );
}
