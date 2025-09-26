import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@superatom-turbo/trpc/types';
import { API_URL as API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL; // points to backend api

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`, // your backend tRPC endpoint
    }),
  ],
});