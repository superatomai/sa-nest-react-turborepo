// apps/frontend/src/App.tsx
import { trpc } from './utils/trpc';

export function App() {
  const hello = trpc.hello.useQuery({ name: 'World' });

  if (hello.isLoading) return <p className="text-blue-500">Loading...</p>;
  if (hello.error) return <p className="text-red-500">{hello.error.message}</p>;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-green-600">{hello.data?.greeting}</h1>
    </div>
  );
}
