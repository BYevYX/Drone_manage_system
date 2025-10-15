'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/src/lib/hooks/useAuth';

// Development mode bypass
const isDevelopmentMode = process.env.NODE_ENV === 'development';
const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

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
    // Skip auth checks in development mode with bypass
    if (isDevelopmentMode && bypassAuth) return;
    
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

  // Development mode bypass
  if (isDevelopmentMode && bypassAuth) {
    return (
      <div>
        {/* Development mode indicator */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-1 text-sm font-medium">
          🚧 РЕЖИМ РАЗРАБОТКИ - Аутентификация отключена
        </div>
        <div className="pt-8">{children}</div>
      </div>
    );
  }

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
