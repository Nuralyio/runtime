import { APIS_URL } from "../constants";

export interface Revision {
  id: string;
  applicationId: string;
  revision: number;
  versionLabel?: string;
  description?: string;
  appVersion: number;
  pageRefs: { pageId: string; version: number }[];
  componentRefs: { componentId: string; version: number }[];
  createdBy: string;
  createdAt: string;
  isPublished?: boolean;
}

export interface PublishedVersion {
  id: string;
  applicationId: string;
  revision: number;
  publishedBy: string;
  publishedAt: string;
}

export interface RevisionSnapshot {
  app: any;
  pages: any[];
  components: any[];
}

export interface ListRevisionsResponse {
  revisions: Revision[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch all revisions for an application
 */
export async function fetchRevisions(
  applicationUuid: string,
  headers: Record<string, string>,
  page: number = 1,
  limit: number = 20
): Promise<{ status: string; data?: ListRevisionsResponse; error?: any }> {
  try {
    const url = `${APIS_URL.getRevisions(applicationUuid)}?page=${page}&limit=${limit}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch revisions: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Fetch a specific revision
 */
export async function fetchRevision(
  applicationUuid: string,
  revision: number,
  headers: Record<string, string>
): Promise<{ status: string; data?: Revision; error?: any }> {
  try {
    const response = await fetch(APIS_URL.getRevision(applicationUuid, revision), { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch revision: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Fetch revision preview data
 */
export async function fetchRevisionPreview(
  applicationUuid: string,
  revision: number,
  headers: Record<string, string>
): Promise<{ status: string; data?: RevisionSnapshot; error?: any }> {
  try {
    const response = await fetch(APIS_URL.getRevisionPreview(applicationUuid, revision), { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch revision preview: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Fetch published version
 */
export async function fetchPublishedVersion(
  applicationUuid: string,
  headers: Record<string, string>
): Promise<{ status: string; data?: PublishedVersion | null; error?: any }> {
  try {
    const response = await fetch(APIS_URL.getPublishedRevision(applicationUuid), { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return { status: "OK", data: null };
      }
      throw new Error(`Failed to fetch published version: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Create a new revision (save version)
 */
export async function createRevision(
  applicationUuid: string,
  headers: Record<string, string>,
  options?: { versionLabel?: string; description?: string }
): Promise<{ status: string; data?: Revision; error?: any }> {
  try {
    const response = await fetch(APIS_URL.createRevision(applicationUuid), {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options || {})
    });

    if (!response.ok) {
      throw new Error(`Failed to create revision: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Publish a revision
 */
export async function publishRevision(
  applicationUuid: string,
  revision: number,
  headers: Record<string, string>
): Promise<{ status: string; data?: PublishedVersion; error?: any }> {
  try {
    const response = await fetch(APIS_URL.publishRevision(applicationUuid, revision), {
      method: "POST",
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to publish revision: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Restore to a revision
 */
export async function restoreRevision(
  applicationUuid: string,
  revision: number,
  headers: Record<string, string>,
  description?: string
): Promise<{ status: string; data?: Revision; error?: any }> {
  try {
    const response = await fetch(APIS_URL.restoreRevision(applicationUuid, revision), {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      throw new Error(`Failed to restore revision: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Delete a revision
 */
export async function deleteRevision(
  applicationUuid: string,
  revision: number,
  headers: Record<string, string>
): Promise<{ status: string; error?: any }> {
  try {
    const response = await fetch(APIS_URL.deleteRevision(applicationUuid, revision), {
      method: "DELETE",
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to delete revision: ${response.statusText}`);
    }

    return { status: "OK" };
  } catch (error) {
    return { status: "ERROR", error };
  }
}
