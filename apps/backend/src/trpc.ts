import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../../../packages/trpc';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';
import { getAuth } from '@clerk/express';
import { User as TRPCUser } from '../../../packages/trpc';

let nestApp: INestApplication;

export const setNestApp = (app: INestApplication) => {
  nestApp = app;
};

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }: { req: Request; res: Response }) => {
    try {
      const auth = getAuth(req);
      
      return {
        req,
        res,
        nestApp,
        user: auth.userId ? { id: auth.userId } as TRPCUser : undefined,
      };
    } catch (error) {
      console.error('Error extracting auth from request:', error);
      return {
        req,
        res,
        nestApp,
        user: undefined,
      };
    }
  },
});