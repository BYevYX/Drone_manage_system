'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/src/lib/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'CLIENT' | 'CONTRACTOR' | 'OPERATOR' | 'ADMIN';
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && user?.userRole !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.userRole !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
