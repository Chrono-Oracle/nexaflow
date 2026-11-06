export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface UploadingFileItem {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'cancelled';
  file?: File;
  url?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileCategory(
  name: string,
  mimeType?: string
): 'pdf' | 'doc' | 'image' | 'video' | 'archive' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'md'].includes(ext) ||
    mimeType?.includes('word') ||
    mimeType?.includes('text')
  ) {
    return 'doc';
  }
  if (
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext) ||
    mimeType?.startsWith('image/')
  ) {
    return 'image';
  }
  if (
    ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(ext) ||
    mimeType?.startsWith('video/')
  ) {
    return 'video';
  }
  if (
    ['zip', 'rar', 'tar', 'gz', '7z'].includes(ext) ||
    mimeType?.includes('zip')
  ) {
    return 'archive';
  }
  return 'other';
}
