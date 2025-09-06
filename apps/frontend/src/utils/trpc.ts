import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { appRouter } from '../../../../packages/trpc';

type AppRouter = typeof appRouter;

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc', // your backend tRPC endpoint
    }),
  ],
});