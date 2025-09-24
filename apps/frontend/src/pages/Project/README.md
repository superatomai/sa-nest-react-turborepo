# Project Logs - Real-time WebSocket Monitoring

## Overview
The Project Logs page provides real-time monitoring of WebSocket messages with 24-hour historical data persistence. Built with React hooks and connects to our Cloudflare Durable Object WebSocket service.

## 🏗️ Architecture

```
ProjLogsV2.tsx ──► useAdminWebSocketV2 ──► Production WebSocket ──► Durable Object
      │                    │                        │                    │
      └─ UI Display        └─ Connection           └─ Real-time         └─ 24h Storage
                              Management              Messages
```

## 📁 File Structure

```
src/pages/Project/
├── ProjLogsV2.tsx          # Main logs UI component
└── README.md               # This documentation

src/hooks/
└── useAdminWebSocketV2.ts  # WebSocket connection hook
```

## 🔌 Hook Implementation - `useAdminWebSocketV2`

### Connection Management
```typescript
const WEBSOCKET_URL = 'wss://user-websocket.ashish-91e.workers.dev';
const ws = new WebSocket(`${WEBSOCKET_URL}/websocket?type=admin&projectId=${projectId}`);
```

### State Management
```typescript
const [logs, setLogs] = useState<WebSocketLog[]>([]);
const [connected, setConnected] = useState(false);
const [historicalLogsLoaded, setHistoricalLogsLoaded] = useState(false);
const [totalHistoricalCount, setTotalHistoricalCount] = useState(0);
```

### Message Handling
1. **Historical Logs**: Received on connection
```typescript
if (message.type === 'historical_logs') {
  setLogs(message.logs);
  setTotalHistoricalCount(message.totalCount);
  setHistoricalLogsLoaded(true);
}
```

2. **Live Messages**: Real-time updates
```typescript
const logEntry: WebSocketLog = {
  id: message.id || crypto.randomUUID(),
  timestamp: message.timestamp || Date.now(),
  messageType: message.type || 'UNKNOWN',
  direction: message.direction || 'incoming',
  data: message,
  clientId: message.clientId,
  clientType: message.clientType,
  projectId: message.projectId || projectId,
  fromClientId: message._meta?.from
};
setLogs(prev => [logEntry, ...prev].slice(0, 500));
```

## 🎨 UI Component - `ProjLogsV2`

### Layout Structure
```
┌─ Header (Projects / Name / Logs)
├─ Connection Status + Total Logs + Pagination + Clear
└─ Card (rounded-xl, gradient header)
  ├─ WebSocket Messages Title + Status
  ├─ Logs Content (scrollable)
  └─ Pagination (bottom)
```

### Pagination Logic
```typescript
const logsPerPage = 8;
const paginatedLogs = useMemo(() => {
  const startIndex = (currentPage - 1) * logsPerPage;
  return logs.slice(startIndex, startIndex + logsPerPage);
}, [logs, currentPage]);
```

### Smart Message Display
- **🔗 Connected**: "ADMIN CONNECTED" + connection details
- **🔍 GraphQL Query**: Preview + Request ID + "View Full JSON"
- **📊 Query Response**: Summary + "View Full JSON"
- **📡 Ping/Pong**: Simple ping indicator + "View Full JSON"
- **🔄 Forwarded**: From client + forward time + "View Full JSON"
- **📄 Generic**: Message type + "View Full JSON"

## 🎯 Key Features

### Real-time Connection
- ✅ Auto-connects to production WebSocket
- ✅ Shows connection status with colored dot
- ✅ Handles reconnection automatically

### Historical Data
- ✅ Loads last 24 hours on connection
- ✅ Shows total historical count
- ✅ Merges with live data seamlessly

### Smart UI
- ✅ Compact log cards with gradients
- ✅ Badge-based message typing
- ✅ Expandable JSON views
- ✅ Pagination (8 logs per page)
- ✅ Modern rounded design

### Performance
- ✅ Limited to 500 logs in memory
- ✅ Efficient pagination
- ✅ Memoized calculations

## 🔄 Data Flow

### 1. Page Load
```
User visits /projects/35/project-logs
    ↓
useAdminWebSocketV2 hook initializes
    ↓
Connects to wss://user-websocket.ashish-91e.workers.dev
    ↓
Durable Object sends historical_logs message
    ↓
UI shows historical data + "Connected" status
```

### 2. Live Updates
```
CLI sends message to WebSocket
    ↓
Durable Object stores log + broadcasts to admins
    ↓
Hook receives message + adds to state
    ↓
UI updates with new log at top of page 1
```

### 3. User Actions
```
User clicks "View Full JSON"
    ↓
<details> expands showing complete message data

User changes page
    ↓
paginatedLogs recalculates
    ↓
UI shows different 8 logs

User clicks "Clear"
    ↓
setLogs([]) clears current view
    ↓
Historical data preserved on server
```

## 🎨 Styling Approach

### Card Design
- **Main Card**: `rounded-xl shadow-lg` with gradient header
- **Log Cards**: `rounded-lg` with colored gradients per direction
- **Badges**: `rounded-full` pills with proper spacing
- **Content**: `rounded-lg` with subtle shadows

### Color Coding
- **Incoming**: Blue gradients (`from-blue-50/80 to-blue-50/40`)
- **Outgoing**: Green gradients (`from-green-50/80 to-green-50/40`)
- **Client Type**: Blue background badges
- **Connection**: Green/red dots

## 🚀 Usage

### Route Configuration
```typescript
<Route
  path="projects/:projectId/project-logs"
  element={
    <ProtectedRoute>
      <ProjLogsV2/>
    </ProtectedRoute>
  }
/>
```

### URL Pattern
```
http://localhost:5173/projects/35/project-logs
```

## 🔧 Development

### Local Testing
```bash
# Start WebSocket service
cd ws-sa/do-websocket && npm run dev

# Start frontend
cd sa-nest-react-turborepo && pnpm dev

# Visit: http://localhost:5173/projects/35/project-logs
```

### Testing Message Flow
```javascript
// Create test runtime connection
const runtime = new WebSocket('ws://127.0.0.1:8787/websocket?type=runtime&projectId=35');
runtime.send(JSON.stringify({
  type: 'graphql_query',
  requestId: 'test-123',
  projectId: '35',
  query: 'query { users { id name } }',
  timestamp: Date.now()
}));
```

## 🎯 Benefits

1. **Real-time Monitoring**: See live WebSocket traffic
2. **Historical Context**: 24-hour message history
3. **Professional UI**: Modern, clean interface
4. **Developer Friendly**: Full JSON access for debugging
5. **Production Ready**: Error handling and reconnection
6. **Efficient**: Paginated, optimized performance

Perfect for debugging CLI connections, monitoring GraphQL queries, and understanding WebSocket message flow!