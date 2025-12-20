import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useTRPC } from '@/utils/trpc';
import { useAccount } from 'wagmi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function JobApplication({
  jobDesc,
  jobId,
  clientWallet,
}: {
  jobDesc: string;
  jobId: string;
  clientWallet: string;
}) {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { address } = useAccount();

  const { mutate: createJobApplication, isPending } = useMutation(
    trpc.job.createJobApplication.mutationOptions({
      onSuccess: () => {
        toast.success('Job application created successfully!');
        setOpen(false);
      },
    }),
  );

  const handleApplyJob = () => {
    if (clientWallet === address) {
      return toast.error('You cannot apply for your own job!');
    }

    createJobApplication({
      coverLetter,
      jobId,
      freelancerWallet: address as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button className='w-full' variant='outline'>
            Apply This Job
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Apply</DialogTitle>
            <DialogDescription>{jobDesc}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <Textarea
              name='coverLetter'
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button
              disabled={isPending || !coverLetter}
              onClick={handleApplyJob}
              type='submit'
            >
              {isPending && <Loader2 className='animate-spin' />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
