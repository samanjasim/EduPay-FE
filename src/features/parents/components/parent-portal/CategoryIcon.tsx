import { Bus, Clock, GraduationCap, Tag, Utensils } from 'lucide-react';
import type { ParentFeeIconKey } from '../../api/parent-portal.api';

export function CategoryIcon({ iconKey, className }: { iconKey: ParentFeeIconKey; className?: string }) {
  switch (iconKey) {
    case 'graduation':
      return <GraduationCap className={className} aria-hidden />;
    case 'bus':
      return <Bus className={className} aria-hidden />;
    case 'clock':
      return <Clock className={className} aria-hidden />;
    case 'utensils':
      return <Utensils className={className} aria-hidden />;
    default:
      return <Tag className={className} aria-hidden />;
  }
}
