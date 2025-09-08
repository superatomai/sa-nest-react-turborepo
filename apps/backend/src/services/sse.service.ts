import { Injectable } from '@nestjs/common';
import { Response } from 'express';

export interface SSEMessage {
  type: 'status' | 'error' | 'complete' | 'end';
  message: string;
  data?: any;
  timestamp?: number;
}

export interface SSEController {
  sendMessage(type: string, message: string, data?: any): void;
  sendError(message: string, data?: any): void;
  sendComplete(message: string, data?: any): void;
  close(): void;
  isClosed(): boolean;
}

@Injectable()
export class SSEService {
  
  /**
   * Creates an SSE stream controller for a response
   */
  createSSEController(res: Response): SSEController {
    let isStreamClosed = false;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    const sendMessage = (type: string, message: string, data?: any) => {
      if (isStreamClosed) {
        console.log('Stream already closed, skipping message:', message);
        return;
      }

      const payload: SSEMessage = {
        type: type as any,
        message,
        timestamp: Date.now(),
        ...(data && { data })
      };

      try {
        const sseData = `data: ${JSON.stringify(payload)}\n\n`;
        res.write(sseData);
      } catch (error) {
        console.log('Failed to send message, stream may be closed:', error);
        isStreamClosed = true;
      }
    };

    const sendError = (message: string, data?: any) => {
      if (isStreamClosed) return;

      sendMessage('error', `❌ ${message}`, {
        success: false,
        error: message,
        ...data
      });

      // Add a small delay before closing to ensure message is sent
      setTimeout(() => {
        if (!isStreamClosed) {
          isStreamClosed = true;
          try {
            res.end();
          } catch (error) {
            console.log('Error closing stream:', error);
          }
        }
      }, 50);
    };

    const sendComplete = (message: string, data?: any) => {
      if (isStreamClosed) return;

      sendMessage('complete', `🎉 ${message}`, data);
      
      // Send end signal
      sendMessage('end', 'Stream completed successfully');

      // Close after brief delay
      setTimeout(() => {
        if (!isStreamClosed) {
          isStreamClosed = true;
          try {
            res.end();
          } catch (error) {
            console.log('Error closing stream:', error);
          }
        }
      }, 100);
    };

    const close = () => {
      if (!isStreamClosed) {
        isStreamClosed = true;
        try {
          res.end();
        } catch (error) {
          console.log('Error closing stream:', error);
        }
      }
    };

    const isClosed = () => isStreamClosed;

    // Handle client disconnect
    res.on('close', () => {
      console.log('Client disconnected from SSE stream');
      isStreamClosed = true;
    });

    res.on('error', (error) => {
      console.log('SSE stream error:', error);
      isStreamClosed = true;
    });

    return {
      sendMessage,
      sendError,
      sendComplete,
      close,
      isClosed
    };
  }
}