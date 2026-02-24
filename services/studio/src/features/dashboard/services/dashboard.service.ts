/**
 * Dashboard Service
 * Aggregates data from multiple services for the dashboard
 * Uses lazy loading to load services only when needed
 *
 * Note: Pinned items and view mode preferences are managed by user-preferences.service.ts
 * and user-preferences.store.ts using KV storage.
 */

import { getFetchAllApplications, getWorkflowService, getWhiteboardService, getKvStore } from '../../../services/lazy-loader';
import { type PublishedVersion } from '../../../services/revisions/revision.service';
import type { KvEntry } from '../../../services/kv/kv.types';

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
  isPinned?: boolean;
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
  isTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isPinned?: boolean;
}

/**
 * Fetch all applications with their published status (single API call - publishedAt included in response)
 * @param headers - Request headers
 * @param pinnedIds - Set of pinned application IDs (from user preferences store)
 */
export async function fetchApplicationsWithStatus(
  headers: Record<string, string>,
  pinnedIds: Set<string> = new Set()
): Promise<ApplicationWithStatus[]> {
  const fetchAllApplications = await getFetchAllApplications();
  const appsResponse = await fetchAllApplications(headers);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  // publishedAt is now included in the applications response via DB join
  const applications = appsResponse.data.map((app: any) => ({
    uuid: app.uuid,
    name: app.name,
    description: app.description,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    isPublished: !!app.publishedAt,
    publishedAt: app.publishedAt,
    publishedVersion: null, // No longer fetching full version details
    isPinned: pinnedIds.has(app.uuid)
  }));

  return applications;
}

/**
 * Fetch all workflows across all applications (single API call)
 * @param headers - Request headers
 * @param pinnedIds - Set of pinned workflow IDs (from user preferences store)
 */
export async function fetchAllWorkflowsAcrossApps(
  headers: Record<string, string>,
  pinnedIds: Set<string> = new Set()
): Promise<WorkflowWithAppName[]> {
  // Lazy load services
  const [fetchAllApplications, workflowService] = await Promise.all([
    getFetchAllApplications(),
    getWorkflowService(),
  ]);

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
    isTemplate: (workflow as any).isTemplate ?? false,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    isPinned: pinnedIds.has((workflow as any).uuid || workflow.id)
  }));

  return allWorkflows;
}

/**
 * Whiteboard with application name for display
 */
export interface WhiteboardWithAppName {
  id: string;
  name: string;
  description?: string;
  applicationId: string;
  applicationName?: string;
  backgroundColor?: string;
  gridEnabled?: boolean;
  elementsCount: number;
  connectorsCount: number;
  createdAt?: string;
  updatedAt?: string;
  isPinned?: boolean;
}

/**
 * Fetch all whiteboards across all applications (single API call)
 * @param headers - Request headers
 * @param pinnedIds - Set of pinned whiteboard IDs (from user preferences store)
 */
export async function fetchAllWhiteboardsAcrossApps(
  headers: Record<string, string>,
  pinnedIds: Set<string> = new Set()
): Promise<WhiteboardWithAppName[]> {
  // Lazy load services
  const [fetchAllApplications, whiteboardService] = await Promise.all([
    getFetchAllApplications(),
    getWhiteboardService(),
  ]);

  // Fetch applications and all whiteboards in parallel
  const [appsResponse, allWhiteboardsData] = await Promise.all([
    fetchAllApplications(headers),
    whiteboardService.getAllWhiteboards(),
  ]);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  const apps = appsResponse.data;

  // Create a map of applicationId -> applicationName for quick lookup
  const appNameMap = new Map<string, string>();
  for (const app of apps) {
    appNameMap.set(app.uuid, app.name);
  }

  // Map whiteboards to include application name and pinned status
  const allWhiteboards: WhiteboardWithAppName[] = allWhiteboardsData.map(wb => ({
    id: wb.id,
    name: wb.name,
    description: wb.description,
    applicationId: wb.applicationId,
    applicationName: appNameMap.get(wb.applicationId) || 'Unknown',
    backgroundColor: wb.backgroundColor,
    gridEnabled: wb.gridEnabled,
    elementsCount: wb.elements?.length || 0,
    connectorsCount: wb.connectors?.length || 0,
    createdAt: wb.createdAt,
    updatedAt: wb.updatedAt,
    isPinned: pinnedIds.has(wb.id)
  }));

  return allWhiteboards;
}

/**
 * Fetch all KV entries across all applications (single API call)
 */
export async function fetchAllKvEntriesAcrossApps(
  headers: Record<string, string>
): Promise<(KvEntry & { applicationName?: string })[]> {
  // Lazy load services
  const [fetchAllApplications, kvStore] = await Promise.all([
    getFetchAllApplications(),
    getKvStore(),
  ]);

  // Fetch applications and all KV entries in parallel
  const [appsResponse, allEntries] = await Promise.all([
    fetchAllApplications(headers),
    kvStore.getAllKvEntries(),
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
  // Lazy load services
  const [fetchAllApplications, kvStore] = await Promise.all([
    getFetchAllApplications(),
    getKvStore(),
  ]);

  // Fetch applications and all database KV entries in parallel
  const [appsResponse, allEntries] = await Promise.all([
    fetchAllApplications(headers),
    kvStore.getAllKvEntries('database/'),
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
    const name = keyPath.replace('database/', '') || keyPath;

    let type = 'postgresql';
    const value = entry.value;

    if (typeof value === 'object' && value !== null) {
      type = value.type || value.driver || 'postgresql';
    } else if (typeof value === 'string') {
      if (value.startsWith('postgres://') || value.startsWith('postgresql://')) {
        type = 'postgresql';
      } else if (value.startsWith('mysql://')) {
        type = 'mysql';
      } else if (value.startsWith('mongodb://')) {
        type = 'mongodb';
      } else if (value.startsWith('redis://')) {
        type = 'redis';
      }
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
