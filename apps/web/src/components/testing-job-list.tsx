import { useReadContract, useReadContracts } from 'wagmi';
import abi from '@/lib/abi.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export function JobList() {
  // 1. Fetch the total number of jobs
  const { data: jobCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'nextJobId', // Change this to whatever your counter is named
  });

  // 2. Prepare the calls for each job ID
  const jobCalls = Array.from({ length: Number(jobCount || 0) }).map(
    (_, i) => ({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'jobs', // The name of your public mapping or getter
      args: [BigInt(i)],
    }),
  );

  // 3. Batch fetch all job data
  const { data: jobsData, isLoading } = useReadContracts({
    contracts: jobCalls,
    query: {
      enabled: !!jobCount, // Only run if we actually have a count
    },
  });

  if (isLoading) return <p>Loading jobs...</p>;

  return (
    <div>
      {jobsData?.map((result, index) => {
        if (result.status === 'failure') return null;

        const job = result.result; // This is your Job struct
        return (
          <div key={index} className='border p-4 mb-2'>
            <h3>Job #{index}</h3>
            <p>Arbiter: {job[2]}</p>{' '}
            {/* Use index if not using named outputs */}
            <p>Total Amount: {job[1].toString()} Wei</p>
          </div>
        );
      })}
    </div>
  );
}
