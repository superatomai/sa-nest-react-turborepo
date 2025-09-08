import { CreateOrganization } from "@clerk/clerk-react";

export default function CreateOrganizationWrapper() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your first organization to get started.
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <CreateOrganization 
            afterCreateOrganizationUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}