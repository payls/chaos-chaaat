'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-toastify';

export default function UserNav({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <h1 className="text-2xl font-bold text-primary-600">Pave</h1>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/user/dashboard"
                className="text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <Link
                href="/user/properties"
                className="text-gray-700 hover:text-primary-600"
              >
                Properties
              </Link>
              <Link
                href="/user/saved"
                className="text-gray-700 hover:text-primary-600"
              >
                Saved
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
