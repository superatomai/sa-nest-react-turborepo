import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
export const trpc = createTRPCReact();
export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: 'http://localhost:3000/trpc', // your backend tRPC endpoint
        }),
    ],
});
