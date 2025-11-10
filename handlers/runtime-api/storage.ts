/**
 * File Storage Functions
 * 
 * Functions for uploading and browsing files in storage.
 */

import Editor from '../../state/editor';

export function createStorageFunctions() {
  return {
    /**
     * Uploads one or more files to storage
     * 
     * @param files - Single file or array of files to upload
     * @param folderPath - Destination folder path
     * @returns Upload result(s)
     */
    UploadFile: async (files: File | File[], folderPath: string = "my-folder"): Promise<any> => {
      // Normalize to array
      const fileArray = Array.isArray(files) ? files : [files];
      
      const results = [];
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("contentType", file.type || "");
        
        try {
          const response = await fetch(`/api/v1/storage/files/${folderPath}`, {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
          }
          
          const result = await response.json();
          Editor.Console.log({ message: "Upload success", data: result });
          results.push(result);
        } catch (err) {
          Editor.Console.error({ message: "Upload failed", error: err });
          throw err;
        }
      }
      
      // Return single result if single file, array if multiple
      return results.length === 1 ? results[0] : results;
    },

    /**
     * Browses files in a folder with pagination support
     * 
     * @param folderPath - Folder path to browse
     * @param options - Browse options (continuation token, limit)
     * @returns List of files and continuation token
     */
    BrowseFiles: async (
      folderPath: string = "my-folder",
      options: { continuation?: string | null; limit?: number } = {}
    ): Promise<any> => {
      try {
        const { continuation = null, limit = 100 } = options;
        let url = `/api/v1/storage/browse/${folderPath}`;
        
        const params = new URLSearchParams();
        if (continuation) params.append("continuation", continuation);
        if (limit) params.append("limit", limit.toString());
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "accept": "*/*"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Browse failed with status ${response.status}`);
        }
        
        const result = await response.json();
        Editor.Console.log({ message: "Browse success", data: result });
        return result;
      } catch (err) {
        Editor.Console.error({ message: "Browse failed", error: err });
        throw err;
      }
    },
  };
}
