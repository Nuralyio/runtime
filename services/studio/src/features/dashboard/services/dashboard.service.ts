/**
 * Dashboard Service
 * Aggregates data from multiple services for the dashboard
 */

import { fetchAllApplications } from '../../../services/applications/fetch-all-applications';
import { fetchPublishedVersion, type PublishedVersion } from '../../../services/revisions/revision.service';
import { workflowService } from '../../../services/workflow.service';
import { getKvEntries, type KvEntry } from '../../runtime/redux/store/kv';

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
  name: string;
  description?: string;
  applicationId: string;
  applicationName?: string;
  status: string;
  nodes: any[];
  edges: any[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch all applications with their published status
 */
export async function fetchApplicationsWithStatus(
  headers: Record<string, string>
): Promise<ApplicationWithStatus[]> {
  const appsResponse = await fetchAllApplications(headers);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  const apps = appsResponse.data;

  // Fetch published status for each app in parallel
  const appsWithStatus = await Promise.all(
    apps.map(async (app: any) => {
      try {
        const publishedResponse = await fetchPublishedVersion(app.uuid, headers);
        const published = publishedResponse.status === 'OK' ? publishedResponse.data : null;

        return {
          uuid: app.uuid,
          name: app.name,
          description: app.description,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          isPublished: !!published,
          publishedAt: published?.publishedAt,
          publishedVersion: published
        };
      } catch (error) {
        console.error(`Failed to fetch published status for app ${app.uuid}:`, error);
        return {
          uuid: app.uuid,
          name: app.name,
          description: app.description,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          isPublished: false,
          publishedAt: undefined,
          publishedVersion: null
        };
      }
    })
  );

  return appsWithStatus;
}

/**
 * Fetch all workflows across all applications
 */
export async function fetchAllWorkflowsAcrossApps(
  headers: Record<string, string>
): Promise<WorkflowWithAppName[]> {
  const appsResponse = await fetchAllApplications(headers);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  const apps = appsResponse.data;

  // Fetch workflows for each app in parallel
  const allWorkflowsNested = await Promise.all(
    apps.map(async (app: any) => {
      try {
        const workflows = await workflowService.getWorkflowsByApplication(app.uuid);
        // Add application name to each workflow
        return workflows.map(workflow => ({
          ...workflow,
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          applicationId: app.uuid,
          applicationName: app.name,
          status: 'active',
          nodes: [],
          edges: [],
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt
        } as WorkflowWithAppName));
      } catch (error) {
        console.error(`Failed to fetch workflows for app ${app.uuid}:`, error);
        return [];
      }
    })
  );

  return allWorkflowsNested.flat();
}

/**
 * Fetch all KV entries across all applications
 */
export async function fetchAllKvEntriesAcrossApps(
  headers: Record<string, string>
): Promise<(KvEntry & { applicationName?: string })[]> {
  const appsResponse = await fetchAllApplications(headers);

  if (appsResponse.status !== 'OK' || !appsResponse.data) {
    console.error('Failed to fetch applications:', appsResponse.error);
    return [];
  }

  const apps = appsResponse.data;

  // Fetch KV entries for each app in parallel
  const allEntriesNested = await Promise.all(
    apps.map(async (app: any) => {
      try {
        const entries = await getKvEntries(app.uuid);
        if (!entries) return [];

        // Add application name to each entry
        return entries.map(entry => ({
          ...entry,
          applicationName: app.name
        }));
      } catch (error) {
        console.error(`Failed to fetch KV entries for app ${app.uuid}:`, error);
        return [];
      }
    })
  );

  return allEntriesNested.flat();
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
