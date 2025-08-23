import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 w-full max-w-sm">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if email is confirmed
  if (!user.email_confirmed_at) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            E-Mail bestätigen
          </h1>
          <p className="text-muted-foreground">
            Bitte überprüfe deine E-Mails und klicke auf den Bestätigungslink, 
            bevor du die App nutzen kannst.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};