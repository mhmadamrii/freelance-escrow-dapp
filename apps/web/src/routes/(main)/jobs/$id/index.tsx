import { Button } from '@/components/ui/button';
import abi from '@/lib/abi.json';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

export const Route = createFileRoute('/(main)/jobs/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();

  const { id } = Route.useParams();
  const { address } = useAccount();

  const { data } = useQuery(
    trpc.job.jobById.queryOptions({
      jobId: id,
    }),
  );

  console.log({
    currentAddress: address,
    clientAddress: data?.clientWallet,
  });

  return (
    <div className='min-h-screen container mx-auto flex-col flex justify-center items-center'>
      <h1>Client address: {data?.clientWallet}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      {data?.jobApplications.map((item) => (
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.coverLetter}</p>
          </CardContent>
          <CardFooter>
            {data?.clientWallet.toLowerCase() === address?.toLowerCase() && (
              <Button>Assign Freelancer</Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
