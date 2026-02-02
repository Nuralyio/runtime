/**
 * Dashboard Service
 * Aggregates data from multiple services for the dashboard
 */

import { fetchAllApplications } from '../../../services/applications/fetch-all-applications';
import { type PublishedVersion } from '../../../services/revisions/revision.service';
import { workflowService } from '../../../services/workflow.service';
import { getKvEntries, getAllKvEntries, type KvEntry } from '../../runtime/redux/store/kv';

/**
 * Application with published status information
 */
export interface ApplicationWithStatus {
  uuid: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isPublished: boolean;
  publishedAt?: string;
  publishedVersion?: PublishedVersion | null;
}

/**
 * Workflow with application name for display
 */
export interface WorkflowWithAppName {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  applicationId: string;
  applicationName?: string;
  status: string;
  nodes: any[];
  edges: any[];
  createdAt?: string;
  updatedAt?: string;
  isPinned?: boolean;
}

/**
 * KV key path for pinned workflows (stored per application)
 */
const PINNED_WORKFLOWS_KV_KEY = 'dashboard/pinned-workflows';

/**
 * LocalStorage key for pinned workflows (fallback/cache)
 */
const PINNED_WORKFLOWS_CACHE_KEY = 'nuraly_pinned_workflows';

/**
 * Get pinned workflow IDs from localStorage cache
 */
export function getPinnedWorkflowIds(): Set<string> {
  try {
    const stored = localStorage.getItem(PINNED_WORKFLOWS_CACHE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed to read pinned workflows from localStorage:', e);
  }
  return new Set();
}

/**
 * Save pinned workflow IDs to localStorage cache
 */
function savePinnedWorkflowIdsToCache(ids: Set<string>): void {
  try {
    localStorage.setItem(PINNED_WORKFLOWS_CACHE_KEY, JSON.stringify([...ids]));
  } catch (e) {
    console.error('Failed to save pinned workflows to localStorage:', e);
  }
}

/**
 * Save pinned workflow IDs to KV storage for an application
 */
export async function savePinnedWorkflowsToKv(applicationId: string, workflowIds: string[]): Promise<void> {
  try {
    const { setKvEntry } = await import('../../runtime/redux/store/kv');
    await setKvEntry(PINNED_WORKFLOWS_KV_KEY, {
      applicationId,
      value: workflowIds,
    });
  } catch (e) {
    console.error('Failed to save pinned workflows to KV:', e);
  }
}

/**
 * Get pinned workflow IDs from KV storage for an application
 */
export async function getPinnedWorkflowsFromKv(applicationId: string): Promise<string[]> {
  try {
    const { getKvEntry } = await import('../../runtime/redux/store/kv');
    const entry = await getKvEntry(applicationId, PINNED_WORKFLOWS_KV_KEY);
    if (entry && Array.isArray(entry.value)) {
      return entry.value;
    }
  } catch (e) {
    console.error('Failed to get pinned workflows from KV:', e);
  }
  return [];
}

/**
 * Toggle pinned status for a workflow
 */
export function toggleWorkflowPinned(workflowId: string): boolean {
  const pinnedIds = getPinnedWorkflowIds();
  const isPinned = pinnedIds.has(workflowId);

  if (isPinned) {
    pinnedIds.delete(workflowId);
  } else {
    pinnedIds.add(workflowId);
  }

  savePinnedWorkflowIdsToCache(pinnedIds);
  return !isPinned;
}

/**
 * Clean up pinned workflow IDs by removing deleted workflows
 * @param validWorkflowIds - Set of workflow IDs that actually exist
 */
export function cleanupPinnedWorkflows(validWorkflowIds: Set<string>): void {
  const pinnedIds = getPinnedWorkflowIds();
  let hasChanges = false;

  for (const pinnedId of pinnedIds) {
    if (!validWorkflowIds.has(pinnedId)) {
      pinnedIds.delete(pinnedId);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    savePinnedWorkflowIdsToCache(pinnedIds);
  }
}

/**
 * Fetch all applications with their published status (single API call - publishedAt included in response)
 */
export async function fetchApplicationsWithStatus(
  headers: Record<string, string>
): Promise<ApplicationWithStatus[]> {
  const appsResponse = await fetchAllApplications(headers);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  // publishedAt is now included in the applications response via DB join
  return appsResponse.data.map((app: any) => ({
    uuid: app.uuid,
    name: app.name,
    description: app.description,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    isPublished: !!app.publishedAt,
    publishedAt: app.publishedAt,
    publishedVersion: null // No longer fetching full version details
  }));
}

/**
 * Fetch all workflows across all applications (single API call)
 */
export async function fetchAllWorkflowsAcrossApps(
  headers: Record<string, string>
): Promise<WorkflowWithAppName[]> {
  // Fetch applications and all workflows in parallel
  const [appsResponse, allWorkflowsData] = await Promise.all([
    fetchAllApplications(headers),
    workflowService.getAllWorkflows(),
  ]);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  const apps = appsResponse.data;
  const pinnedIds = getPinnedWorkflowIds();

  // Create a map of applicationId -> applicationName for quick lookup
  const appNameMap = new Map<string, string>();
  for (const app of apps) {
    appNameMap.set(app.uuid, app.name);
  }

  // Map workflows to include application name and pinned status
  const allWorkflows: WorkflowWithAppName[] = allWorkflowsData.map(workflow => ({
    ...workflow,
    id: workflow.id,
    uuid: (workflow as any).uuid || workflow.id,
    name: workflow.name,
    description: workflow.description,
    applicationId: workflow.applicationId,
    applicationName: appNameMap.get(workflow.applicationId) || 'Unknown',
    status: 'active',
    nodes: [],
    edges: [],
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    isPinned: pinnedIds.has((workflow as any).uuid || workflow.id)
  }));

  // Clean up pinned IDs for deleted workflows (using uuid)
  const validWorkflowIds = new Set(allWorkflows.map(w => w.uuid));
  cleanupPinnedWorkflows(validWorkflowIds);

  return allWorkflows;
}

/**
 * Fetch all KV entries across all applications (single API call)
 */
export async function fetchAllKvEntriesAcrossApps(
  headers: Record<string, string>
): Promise<(KvEntry & { applicationName?: string })[]> {
  // Fetch applications and all KV entries in parallel
  const [appsResponse, allEntries] = await Promise.all([
    fetchAllApplications(headers),
    getAllKvEntries(),
  ]);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  if (!allEntries) {
    console.error('Failed to fetch KV entries');
    return [];
  }

  const apps = appsResponse.data;

  // Create a map of applicationId -> applicationName for quick lookup
  const appNameMap = new Map<string, string>();
  for (const app of apps) {
    appNameMap.set(app.uuid, app.name);
  }

  // Add application name to each entry
  return allEntries.map(entry => ({
    ...entry,
    applicationName: appNameMap.get(entry.applicationId) || 'Unknown'
  }));
}

/**
 * Database connection from KV store
 */
export interface DatabaseConnection {
  id: string;
  keyPath: string;
  name: string;
  type: string;
  value: any;
  applicationId: string;
  applicationName?: string;
}

/**
 * Fetch all database connections from KV store (keys starting with database/) - single API call
 */
export async function fetchAllDatabaseConnections(
  headers: Record<string, string>
): Promise<DatabaseConnection[]> {
  // Fetch applications and all database KV entries in parallel
  const [appsResponse, allEntries] = await Promise.all([
    fetchAllApplications(headers),
    getAllKvEntries('database/'),
  ]);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  if (!allEntries) {
    console.error('Failed to fetch database connections');
    return [];
  }

  const apps = appsResponse.data;

  // Create a map of applicationId -> applicationName for quick lookup
  const appNameMap = new Map<string, string>();
  for (const app of apps) {
    appNameMap.set(app.uuid, app.name);
  }

  // Parse each entry into a DatabaseConnection
  return allEntries.map(entry => {
    const keyPath = entry.keyPath;
    const name = keyPath.replace('database/', '').split('/')[0] || keyPath;

    let type = 'PostgreSQL';
    const value = entry.value;

    if (typeof value === 'string') {
      if (value.startsWith('postgres://') || value.startsWith('postgresql://')) {
        type = 'PostgreSQL';
      } else if (value.startsWith('mysql://')) {
        type = 'MySQL';
      } else if (value.startsWith('mongodb://')) {
        type = 'MongoDB';
      } else if (value.startsWith('redis://')) {
        type = 'Redis';
      }
    } else if (typeof value === 'object' && value !== null) {
      type = value.type || value.driver || 'PostgreSQL';
    }

    return {
      id: entry.id,
      keyPath: entry.keyPath,
      name,
      type,
      value,
      applicationId: entry.applicationId,
      applicationName: appNameMap.get(entry.applicationId) || 'Unknown'
    } as DatabaseConnection;
  });
}

/**
 * Format a date string for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateString;
  }
}
