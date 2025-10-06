'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/src/lib/hooks/useAuth';
import { useModalStore } from '@/src/lib/stores/modal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'supplier';
  redirectTo?: string;
  showModal?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = '/',
  showModal = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { openModal } = useModalStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (showModal) {
        openModal('login');
      } else {
        router.push(redirectTo);
      }
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    requiredRole,
    router,
    redirectTo,
    showModal,
    openModal,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
