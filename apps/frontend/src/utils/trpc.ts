import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@superatom-turbo/trpc/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`, // your backend tRPC endpoint
    }),
  ],
});