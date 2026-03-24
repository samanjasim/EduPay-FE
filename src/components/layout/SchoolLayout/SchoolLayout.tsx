import { Outlet } from 'react-router-dom';
import { useUIStore, selectSidebarCollapsed } from '@/stores';
import { cn } from '@/utils';
import { SchoolSidebar } from './SchoolSidebar';
import { SchoolHeader } from './SchoolHeader';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';

export function SchoolLayout() {
  const isCollapsed = useUIStore(selectSidebarCollapsed);
  const { school } = useSchoolContext();

  return (
    <div className="min-h-screen bg-background">
      <SchoolSidebar schoolName={school?.name} />
      <SchoolHeader schoolName={school?.name} />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          isCollapsed ? 'ltr:pl-16 rtl:pr-16' : 'ltr:pl-64 rtl:pr-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
