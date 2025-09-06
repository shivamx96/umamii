'use client';

import BottomNavigation from '@/components/BottomNavigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="pb-24"> {/* Add padding bottom to account for fixed navigation */}
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}