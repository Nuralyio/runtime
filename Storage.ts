export class FileStorage {
  static async upload({
    files,
    folderPath = "my-folder"
  }) {
    for (const file of files) {
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
        console.log("Upload success:", result);
        return result;
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  }
  
  static async browse({
    folderPath = "my-folder",
    continuation = null,
    limit = 100
  }) {
    try {
      let url = `/api/v1/storage/browse/${folderPath}`;
      
      // Add query parameters if provided
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
      console.log("Browse success:", result);
      return result;
    } catch (err) {
      console.error("Browse failed:", err);
      throw err;
    }
  }
}