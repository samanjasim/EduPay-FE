import { Outlet } from 'react-router-dom';
import { ParentHeader } from './ParentHeader';
import { ParentBottomNav } from './ParentBottomNav';

/**
 * Parent self-service shell. Mobile-first: top header + content + sticky bottom nav.
 * On md+ the same nav stays visible — the design is portable to a future Flutter client
 * that consumes the same API contract.
 */
export function ParentLayout() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <ParentHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
        <Outlet />
      </main>
      <ParentBottomNav />
    </div>
  );
}
