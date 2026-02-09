import { APIS_URL } from './constants';

/**
 * Journal log entry from the Journal service
 */
export interface JournalLogEntry {
  id: string;
  timestamp: string;
  service: string;
  type: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  data?: Record<string, unknown>;
  executionId?: string;
  nodeId?: string;
  workflowId?: string;
  applicationId?: string;
  userId?: string;
  traceId?: string;
  spanId?: string;
}

/**
 * Query parameters for fetching logs
 */
export interface JournalQueryParams {
  service?: string;
  type?: string;
  level?: string;
  correlationId?: string;
  from?: string;
  to?: string;
  dataQuery?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response type - the backend returns an array directly
 */
export type JournalQueryResponse = JournalLogEntry[];

/**
 * Stats response from the Journal service
 */
export interface JournalStatsResponse {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const journalService = {
  /**
   * Query logs with filters
   */
  async queryLogs(params: JournalQueryParams): Promise<JournalLogEntry[]> {
    const response = await fetch(APIS_URL.getJournalLogs(params));
    return handleResponse<JournalLogEntry[]>(response);
  },

  /**
   * Get a single log entry by ID
   */
  async getLogById(id: string): Promise<JournalLogEntry> {
    const response = await fetch(APIS_URL.getJournalLog(id));
    return handleResponse<JournalLogEntry>(response);
  },

  /**
   * Get all logs for a specific execution
   */
  async getExecutionLogs(executionId: string): Promise<JournalLogEntry[]> {
    const response = await fetch(APIS_URL.getJournalExecutionLogs(executionId));
    return handleResponse<JournalLogEntry[]>(response);
  },

  /**
   * Get log statistics
   */
  async getStats(): Promise<JournalStatsResponse> {
    const response = await fetch(APIS_URL.getJournalStats());
    return handleResponse<JournalStatsResponse>(response);
  },

  /**
   * Get logs by trace/correlation ID
   */
  async getLogsByTrace(correlationId: string): Promise<JournalLogEntry[]> {
    const response = await fetch(APIS_URL.getJournalTrace(correlationId));
    return handleResponse<JournalLogEntry[]>(response);
  },

  /**
   * Build WebSocket URL for real-time log streaming
   */
  getStreamUrl(filter?: string): string {
    const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:7005';
    const filterPath = filter ? `/${encodeURIComponent(filter)}` : '';
    return `${wsProtocol}//${host}/api/v1/logs/stream${filterPath}`;
  },
};
