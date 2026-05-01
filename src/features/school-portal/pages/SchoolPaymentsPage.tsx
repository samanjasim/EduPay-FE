import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config';
import { PERMISSIONS } from '@/constants';
import { usePermissions } from '@/hooks';

export default function SchoolPaymentsPage() {
  const { hasPermission } = usePermissions();

  return (
    <Navigate
      to={hasPermission(PERMISSIONS.CashCollections.View) ? ROUTES.SCHOOL.REPORTS : ROUTES.SCHOOL.DASHBOARD}
      replace
    />
  );
}
