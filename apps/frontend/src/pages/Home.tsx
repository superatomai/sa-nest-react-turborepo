import { Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';

export default function Home() {
  const hello = trpc.hello.useQuery({ name: 'World' });

  if (hello.isLoading) return <p className="text-blue-500">Loading...</p>;
  if (hello.error) return <p className="text-red-500">{hello.error.message}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          {hello.data?.greeting}
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl">
          Create dynamic UIs using natural language with AI-powered generation
        </p>
        
        <div className="space-y-4">
          <Link 
            to="/editor"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚀 Launch Editor
          </Link>
          
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span className="bg-white px-3 py-1 rounded-full">✨ AI-Powered</span>
            <span className="bg-white px-3 py-1 rounded-full">⚡ Real-time</span>
            <span className="bg-white px-3 py-1 rounded-full">🎯 Type-safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}