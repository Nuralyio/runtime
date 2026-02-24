---
sidebar_position: 24
title: FileUpload
description: A file upload component with drag and drop support
---

# FileUpload

The **FileUpload** component provides a user-friendly interface for uploading files with drag-and-drop support and file type restrictions.

## Overview

FileUpload provides a complete file upload solution with:
- Drag and drop functionality
- File type restrictions
- Upload limit configuration
- File preview support
- Upload progress tracking

## Basic Usage

```typescript
{
  uuid: "my-file-upload",
  name: "document_upload",
  component_type: "file-upload",
  input: {},
  event: {
    onFilesChanged: `
      $uploadedFiles = EventData.files;
      console.log('Files uploaded:', EventData.files.length);
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `accept` | string | `'*/*'` | Accepted file types |
| `drag` | boolean | `true` | Enable drag and drop |
| `limit` | number | `5` | Maximum number of files |
| `tip` | string | `'JPG/PNG files up to 500kb'` | Helper tip text |

---

## Events

### onFilesChanged
**Triggered:** When files are added or removed

**EventData:**
```typescript
{
  files: File[]  // Array of File objects
}
```

**Example:**
```typescript
event: {
  onFilesChanged: `
    const files = EventData.files;
    $uploadedFiles = files;
    $fileCount = files.length;

    // Calculate total size
    let totalSize = 0;
    files.forEach(file => {
      totalSize += file.size;
    });
    $totalSize = (totalSize / 1024 / 1024).toFixed(2) + ' MB';

    // Validate file types
    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      $uploadError = 'Only image files are allowed';
    } else {
      $uploadError = '';
    }
  `
}
```

---

## Common Patterns

### Image Upload with Preview
```typescript
{
  component_type: "file-upload",
  event: {
    onFilesChanged: `
      const files = EventData.files;
      $uploadedFiles = files;

      // Create preview URLs
      const previews = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          previews.push({ name: file.name, url, size: file.size });
        }
      }
      $imagePreviews = previews;
    `
  }
}
```

### Upload to Server
```typescript
{
  component_type: "file-upload",
  event: {
    onFilesChanged: `
      const files = EventData.files;
      $uploading = true;

      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append('file' + index, file);
        });

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        $uploadedUrls = result.urls;
        $uploadSuccess = true;
      } catch (error) {
        $uploadError = 'Upload failed: ' + error.message;
      } finally {
        $uploading = false;
      }
    `
  }
}
```

---

## See Also

- [Button Component](./button.md) - Trigger actions
- [Form Component](./form.md) - Form container
