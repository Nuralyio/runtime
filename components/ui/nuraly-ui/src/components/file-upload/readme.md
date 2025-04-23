# File Upload Web Component

A customizable file upload Web Component built with LitElement that handles file selection and preview, but delegates the actual upload process to the parent application.

## Features

- Drag and drop file upload
- File preview for images
- Progress indication
- Multiple file support
- File type filtering
- Event-based architecture

## Installation

```bash
npm install @nuralyui/file
```

## Usage

```html
<script type="module">
  import '@nuralyui/file';
</script>

<nr-file-upload 
  accept="image/*" 
  multiple
  preview
  tip="Supports JPG, PNG files up to 10MB"
></nr-file-upload>
```

## API

### Properties

| Name      | Type    | Default | Description                                      |
|-----------|---------|---------|--------------------------------------------------|
| accept    | String  | ''      | File types to accept (e.g., 'image/*')           |
| multiple  | Boolean | false   | Allow multiple file selection                    |
| drag      | Boolean | true    | Enable drag and drop                             |
| tip       | String  | ''      | Help text displayed under the upload button      |
| limit     | Number  | 0       | Max number of files (0 = unlimited)              |
| preview   | Boolean | true    | Show image previews for image files              |

### Events

| Event Name    | Detail                                  | Description                              |
|---------------|------------------------------------------|------------------------------------------|
| file-select   | { files: UploadFile[], fileList: UploadFile[] } | Fired when files are selected              |
| file-exceed   | { files: FileList }                     | Fired when file limit is exceeded        |
| file-remove   | { file: UploadFile }                    | Fired when a file is removed             |

### Methods

| Name              | Parameters                                    | Description                              |
|-------------------|-----------------------------------------------|------------------------------------------|
| updateFileStatus  | (uid: string, status: string, percentage?: number) | Update status and progress of a file    |

## Example

```javascript
// Add event listeners to handle file uploads
const fileUpload = document.querySelector('file-upload');

fileUpload.addEventListener('file-select', (event) => {
  const { files } = event.detail;
  
  files.forEach(file => {
    // Update status to 'uploading'
    fileUpload.updateFileStatus(file.uid, 'uploading', 0);
    
    // Simulate upload
    const uploadProcess = setInterval(() => {
      const percentage = Math.min(100, file.percentage + 10);
      fileUpload.updateFileStatus(file.uid, 'uploading', percentage);
      
      if (percentage === 100) {
        clearInterval(uploadProcess);
        // Set file as successfully uploaded
        fileUpload.updateFileStatus(file.uid, 'success');
      }
    }, 500);
  });
});

fileUpload.addEventListener('file-remove', (event) => {
  const { file } = event.detail;
  console.log(`File removed: ${file.name}`);
  // Cancel upload or perform cleanup as needed
});
```

## Styling

The component uses Shadow DOM for encapsulation. You can customize its appearance using CSS custom properties (coming in a future version) or by extending the component and overriding the styles.