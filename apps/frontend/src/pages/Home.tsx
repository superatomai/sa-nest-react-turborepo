import { useOrganization, useUser } from "@clerk/clerk-react";
import { trpc } from "../utils/trpc";
import { Link } from "react-router-dom";

export default function Home() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const {  isLoaded: userLoaded } = useUser();
  const hello = trpc.hello.useQuery({ name: "World" });

  // Since we're using OrganizationRequiredRoute, we know organization exists
  // But still check loading states for API calls
  if (!orgLoaded || !userLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900">
        </div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (hello.isLoading) return <div>Loading...</div>;
  if (hello.error) return <div>Error: {hello.error.message}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">
          {hello.data?.greeting}
        </h1>
        
        <p className="text-xl text-gray-600 text-center mb-8">
          Create dynamic UIs using natural language with AI-powered generation
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/projects"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              📂 View Projects
            </Link>
            <Link 
              to="/editor"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              🚀 Launch Editor
            </Link>
          </div>
          
          <div className="flex flex-col justify-center space-y-2 text-gray-700">
            <div>✨ AI-Powered</div>
            <div>⚡ Real-time</div>
            <div>🎯 Type-safe</div>
          </div>
        </div>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV !== 'production' && organization && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">Current Organization: {organization.name}</p>
            <p className="text-sm text-gray-600">Organization ID: {organization.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}