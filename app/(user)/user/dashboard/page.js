import { createClient } from '@/lib/supabase/server';

export default async function UserDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.first_name || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your properties and activities
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Saved Properties</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Property Views</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Active Tasks</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Messages</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
          <p className="mt-4 text-gray-500">No properties yet</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <p className="mt-4 text-gray-500">No activities yet</p>
        </div>
      </div>
    </div>
  );
}
