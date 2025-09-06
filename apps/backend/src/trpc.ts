import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../../../packages/trpc';
import { Request, Response } from 'express';

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }: { req: Request; res: Response }) => ({}),
});
