import { getStatusBadgeClass } from '../../lib/utils';

interface Props {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: Props) {
  return (
    <span className={`${getStatusBadgeClass(status)} rounded-full capitalize ${className}`}>
      {status}
    </span>
  );
}
