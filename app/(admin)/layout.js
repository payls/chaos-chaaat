import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/layout/AdminNav';

export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // TODO: Add role check for admin access
  // For now, any authenticated user can access

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
