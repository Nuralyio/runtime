import { APIS_URL } from './constants';

export interface WhiteboardDTO {
  id: string;
  name: string;
  description?: string;
  applicationId: string;
  createdBy?: string;
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  allowAnonymousEditing?: boolean;
  maxCollaborators?: number;
  templateId?: string;
  viewport?: string;
  version?: number;
  elements?: WhiteboardElementDTO[];
  connectors?: WhiteboardConnectorDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WhiteboardElementDTO {
  id: string;
  whiteboardId: string;
  name?: string;
  elementType: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex?: number;
  rotation?: number;
  opacity?: number;
  configuration?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textColor?: string;
  textAlign?: string;
  imageUrl?: string;
  imageAlt?: string;
  pathData?: string;
  shapeType?: string;
  fillColor?: string;
  createdBy?: string;
  lastEditedBy?: string;
}

export interface WhiteboardConnectorDTO {
  id: string;
  whiteboardId: string;
  sourceElementId: string;
  targetElementId: string;
  sourcePortId?: string;
  targetPortId?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: string;
  startArrow?: boolean;
  endArrow?: boolean;
  label?: string;
  lineType?: string;
  labelPosition?: number;
  controlPoints?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const whiteboardService = {
  async getAllWhiteboards(): Promise<WhiteboardDTO[]> {
    const response = await fetch(APIS_URL.getAllWhiteboards());
    return handleResponse<WhiteboardDTO[]>(response);
  },

  async getWhiteboards(appId: string): Promise<WhiteboardDTO[]> {
    const response = await fetch(APIS_URL.getWhiteboards(appId));
    return handleResponse<WhiteboardDTO[]>(response);
  },

  async getWhiteboard(id: string): Promise<WhiteboardDTO> {
    const response = await fetch(APIS_URL.getWhiteboard(id));
    return handleResponse<WhiteboardDTO>(response);
  },

  async createWhiteboard(name: string, applicationId: string, description?: string): Promise<WhiteboardDTO> {
    const response = await fetch(APIS_URL.createWhiteboard(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, applicationId, description }),
    });
    return handleResponse<WhiteboardDTO>(response);
  },

  async updateWhiteboard(id: string, data: Partial<WhiteboardDTO>): Promise<WhiteboardDTO> {
    const response = await fetch(APIS_URL.updateWhiteboard(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<WhiteboardDTO>(response);
  },

  async deleteWhiteboard(id: string): Promise<void> {
    const response = await fetch(APIS_URL.deleteWhiteboard(id), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete whiteboard');
    }
  },

  async addElement(whiteboardId: string, element: Partial<WhiteboardElementDTO>): Promise<WhiteboardElementDTO> {
    const response = await fetch(APIS_URL.addWhiteboardElement(whiteboardId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(element),
    });
    return handleResponse<WhiteboardElementDTO>(response);
  },

  async updateElement(whiteboardId: string, elementId: string, element: Partial<WhiteboardElementDTO>): Promise<WhiteboardElementDTO> {
    const response = await fetch(APIS_URL.updateWhiteboardElement(whiteboardId, elementId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(element),
    });
    return handleResponse<WhiteboardElementDTO>(response);
  },

  async deleteElement(whiteboardId: string, elementId: string): Promise<void> {
    const response = await fetch(APIS_URL.deleteWhiteboardElement(whiteboardId, elementId), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete whiteboard element');
    }
  },
};
