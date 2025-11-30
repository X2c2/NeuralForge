'use client';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome to your Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your content and settings
          </p>
        </div>

        <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Your Content</h3>
              <p className="mt-3 text-sm text-gray-500">View and manage your generated content</p>
            </div>
          </div>

          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Community Posts</h3>
              <p className="mt-3 text-sm text-gray-500">View your contributions to the community</p>
            </div>
          </div>

          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              <p className="mt-3 text-sm text-gray-500">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
