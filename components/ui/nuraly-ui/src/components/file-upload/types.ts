export interface UploadFile {
    name: string;
    size: string;
    raw: File;
    status: 'ready' | 'uploading' | 'success' | 'error';
    percentage: number;
    uid: string;
    url?: string; // URL for preview
    isImage?: boolean; // Flag for image files
  }