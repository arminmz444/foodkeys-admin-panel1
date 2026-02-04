import axios from "axios";
import { z } from "zod";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://back.agfo.ir/api/v1/file-system";

export const downloadFileOrFolder = async (
  username,
  fileName,
  filePath,
  downloadName = null
) => {
  try {
	console.log(JSON.stringify(filePath))
	let relativePath = '' 
	for (let i = 0; i < filePath.length; i++) {
		relativePath += filePath[i].id 
		if (i !== filePath.length - 1)
			relativePath += "/"
	}
    // filePath.forEach((item) => {
    //   relativePath += item.id;
    // });
	console.log("relativePath: " + relativePath)
    const url = `${API_BASE_URL}/download/${relativePath}/${fileName}`;

    const response = await axios.get(url, {
      responseType: "blob",
      params: downloadName ? { downloadName } : {},
    });

    const blobUrl = URL.createObjectURL(response.data);

    // Create an anchor <a> element dynamically
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", downloadName || extractFilename(response)); // Set the filename
    link.setAttribute("target", "_blank"); // Open in a new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up after download

    // Optional: Revoke the Blob URL after some time (memory cleanup)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    //
    // const filename = downloadName || extractFilename(response);
    //
    // saveAs(response.data, filename);
    // alert('File downloaded successfully');
    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading file:", error);
    // alert('Failed to download file!');
  }
};

const extractFilename = (response) => {
  const contentDisposition = response.headers["content-disposition"];

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    return match ? match[1] : "download";
  }

  return "download";
};

export const handleDownload = (payload) => {
  downloadFileOrFolder(payload?.username, payload?.fileName, payload?.filePath);
};

export class FileUtils {
  static async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static base64ToBlob(base64, contentType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  static async downloadFile(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const isBase64 = (str) => {
  try {
    // Check if string matches base64 pattern
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    const isValidBase64 = base64Regex.test(str);
    
    // Additional check by trying to decode
    if (isValidBase64) {
      window.atob(str);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result;
      resolve(base64String.split(',')[1]); 
    };
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToFile = (base64, fileName, mimeType) => {
  const byteCharacters = window.atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
  type: z.string().refine(
    (type) => ACCEPTED_FILE_TYPES.includes(type),
    'Invalid file type'
  )
});

export const filesSchema = z.array(fileSchema);

export const CHUNK_SIZE = 5 * 1024 * 1024;

export const streamFile = async (
  file,
  onProgress,
  chunkSize = CHUNK_SIZE
) => {
  const chunks = [];
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const base64Chunk = await fileToBase64(chunk);
    chunks.push(base64Chunk);
    
    onProgress((i + 1) / totalChunks * 100);
  }
  
  return chunks;
};

export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const base64ToBlob = (base64, contentType = 'application/octet-stream') => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: contentType });
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const handleFileUpload = async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    const base64Data = await convertFileToBase64(file);
    const payload = {
      filename: file.name,
      contentType: file.type,
      size: file.size,
      data: base64Data,
    };
    await axios.post('/file/upload', payload);
  } catch (error) {
    console.error('File upload error:', error);
  }
};