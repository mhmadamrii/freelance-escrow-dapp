import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CREATED:
      'bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-green-500/20',
    FUNDED:
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/20',
    WAITING_FUNDING:
      'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/20',
    IN_PROGRESS:
      'bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25 border-purple-500/20',
    COMPLETED:
      'bg-gray-500/15 text-gray-600 dark:text-gray-400 hover:bg-gray-500/25 border-gray-500/20',
    DISPUTED:
      'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-red-500/20',
  };

  const _renderLabel = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'Open';
      case 'FUNDED':
        return 'Funded';
      case 'WAITING_FUNDING':
        return 'Waiting Funding';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Closed';
      case 'DISPUTED':
        return 'Disputed';
      default:
        return status;
    }
  };

  return (
    <Badge
      variant='outline'
      className={`px-3 py-1 capitalize ${styles[status] || ''}`}
    >
      {_renderLabel(status)}
    </Badge>
  );
}
