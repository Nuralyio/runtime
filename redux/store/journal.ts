import { atom } from "nanostores";
import {
  journalService,
  type JournalLogEntry,
  type JournalQueryParams,
  type JournalStatsResponse,
} from "../../../../services/journal.service";

/**
 * Filter state for journal logs
 */
export interface JournalFilters {
  service?: string;
  type?: string;
  level?: string;
  from?: string;
  to?: string;
  correlationId?: string;
  dataQuery?: string;
}

/**
 * Journal state
 */
export interface JournalState {
  logs: JournalLogEntry[];
  total: number;
  limit: number;
  offset: number;
  loading: boolean;
  error: string | null;
  filters: JournalFilters;
  stats: JournalStatsResponse | null;
  streaming: boolean;
  selectedLogId: string | null;
}

/**
 * Initial state
 */
const initialState: JournalState = {
  logs: [],
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null,
  filters: {},
  stats: null,
  streaming: false,
  selectedLogId: null,
};

/**
 * Journal state store
 */
export const $journalState = atom<JournalState>(initialState);

/**
 * WebSocket instance for streaming
 */
let streamingSocket: WebSocket | null = null;

/**
 * Query logs with current filters
 */
export async function queryLogs(
  options?: { offset?: number; limit?: number }
): Promise<void> {
  const state = $journalState.get();
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? state.limit;

  $journalState.set({
    ...state,
    loading: true,
    error: null,
    offset,
    limit,
  });

  try {
    const params: JournalQueryParams = {
      ...state.filters,
      limit,
      offset,
    };

    const logs = await journalService.queryLogs(params);

    $journalState.set({
      ...$journalState.get(),
      logs,
      total: logs.length >= limit ? (offset + limit + 1) : (offset + logs.length), // Estimate total
      loading: false,
    });
  } catch (error) {
    console.error("Failed to query logs:", error);
    $journalState.set({
      ...$journalState.get(),
      loading: false,
      error: error instanceof Error ? error.message : "Failed to fetch logs",
    });
  }
}

/**
 * Set filters and optionally refresh logs
 */
export function setFilters(
  filters: JournalFilters,
  autoRefresh = true
): void {
  const state = $journalState.get();
  $journalState.set({
    ...state,
    filters,
    offset: 0, // Reset pagination when filters change
  });

  if (autoRefresh) {
    queryLogs({ offset: 0 });
  }
}

/**
 * Clear all filters
 */
export function clearFilters(autoRefresh = true): void {
  setFilters({}, autoRefresh);
}

/**
 * Load stats
 */
export async function loadStats(): Promise<void> {
  try {
    const stats = await journalService.getStats();
    const state = $journalState.get();
    $journalState.set({
      ...state,
      stats,
    });
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
}

/**
 * Get a single log entry
 */
export async function getLogById(id: string): Promise<JournalLogEntry | null> {
  try {
    return await journalService.getLogById(id);
  } catch (error) {
    console.error("Failed to get log:", error);
    return null;
  }
}

/**
 * Select a log entry for viewing details
 */
export function selectLog(logId: string | null): void {
  const state = $journalState.get();
  $journalState.set({
    ...state,
    selectedLogId: logId,
  });
}

/**
 * Start streaming logs via WebSocket
 */
export function startStreaming(filter?: string): void {
  if (streamingSocket) {
    stopStreaming();
  }

  const url = journalService.getStreamUrl(filter);

  try {
    streamingSocket = new WebSocket(url);

    streamingSocket.onopen = () => {
      console.log("[Journal] WebSocket connected");
      const state = $journalState.get();
      $journalState.set({
        ...state,
        streaming: true,
      });
    };

    streamingSocket.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data) as JournalLogEntry;
        addStreamingLog(log);
      } catch (error) {
        console.error("[Journal] Failed to parse streaming log:", error);
      }
    };

    streamingSocket.onerror = (error) => {
      console.error("[Journal] WebSocket error:", error);
    };

    streamingSocket.onclose = () => {
      console.log("[Journal] WebSocket disconnected");
      const state = $journalState.get();
      $journalState.set({
        ...state,
        streaming: false,
      });
      streamingSocket = null;
    };
  } catch (error) {
    console.error("[Journal] Failed to start streaming:", error);
  }
}

/**
 * Stop streaming logs
 */
export function stopStreaming(): void {
  if (streamingSocket) {
    streamingSocket.close();
    streamingSocket = null;
  }

  const state = $journalState.get();
  $journalState.set({
    ...state,
    streaming: false,
  });
}

/**
 * Add a log from streaming
 */
export function addStreamingLog(log: JournalLogEntry): void {
  const state = $journalState.get();

  // Add to the beginning of the logs array
  const logs = [log, ...state.logs];

  // Keep only the most recent logs (up to limit * 2 to allow for pagination buffer)
  const maxLogs = state.limit * 2;
  if (logs.length > maxLogs) {
    logs.length = maxLogs;
  }

  $journalState.set({
    ...state,
    logs,
    total: state.total + 1,
  });
}

/**
 * Reset journal state
 */
export function resetJournalState(): void {
  stopStreaming();
  $journalState.set(initialState);
}

/**
 * Get logs for a specific execution
 */
export async function getExecutionLogs(
  executionId: string
): Promise<JournalLogEntry[]> {
  try {
    return await journalService.getExecutionLogs(executionId);
  } catch (error) {
    console.error("Failed to get execution logs:", error);
    return [];
  }
}
