// Debug utility functions
import { useAuth } from '@/lib/auth.tsx';

export function DebugAuthState() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div className="fixed bottom-0 left-0 bg-black bg-opacity-80 text-white p-4 text-xs max-w-xs overflow-auto z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>isLoading: {isLoading ? 'true' : 'false'}</div>
      <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
    </div>
  );
}