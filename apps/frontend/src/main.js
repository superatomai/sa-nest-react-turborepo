import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { trpc, trpcClient } from './utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(trpc.Provider, { client: trpcClient, queryClient: queryClient, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(App, {}) }) }));
