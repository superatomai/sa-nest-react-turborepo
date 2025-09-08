import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../../../packages/trpc';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';
import { getAuth } from '@clerk/express';

let nestApp: INestApplication;

export const setNestApp = (app: INestApplication) => {
  nestApp = app;
};

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }: { req: Request; res: Response }) => {
    try {
      const auth = getAuth(req);
      console.log('Clerk auth result:', auth);
      
      return {
        req,
        nestApp,
        user: auth.userId ? { id: auth.userId } : undefined,
      };
    } catch (error) {
      console.error('Error extracting auth from request:', error);
      return {
        req,
        nestApp,
        user: undefined,
      };
    }
  },
});