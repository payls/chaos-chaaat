import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-2xl font-bold text-primary-600">Pave</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to Pave
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your real estate business with our all-in-one CRM and messaging platform
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup" className="btn-primary">
                Get started
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900">Property Management</h3>
              <p className="mt-2 text-gray-600">
                Manage your property listings with ease and showcase them to potential buyers.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900">CRM & Contacts</h3>
              <p className="mt-2 text-gray-600">
                Keep track of all your clients, leads, and contacts in one centralized system.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900">Messaging & Automation</h3>
              <p className="mt-2 text-gray-600">
                Communicate with clients via WhatsApp, SMS, and more with automated workflows.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Pave. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
