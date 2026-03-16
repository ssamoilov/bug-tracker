import { Attachment } from '../types';
import { generateAttachmentId } from './idGenerator';

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function createAttachment(file: File): Promise<Attachment> {
  const data = await fileToBase64(file);
  let thumbnail: string | undefined;

  // Create thumbnail for images
  if (file.type.startsWith('image/')) {
    thumbnail = await createImageThumbnail(data, 200); // Увеличим размер превью до 200px для лучшего качества
  }

  return {
    id: generateAttachmentId(),
    name: file.name,
    type: file.type,
    size: file.size,
    data,
    thumbnail,
    createdAt: new Date().toISOString(),
  };
}

export async function createImageThumbnail(base64: string, maxWidth = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Создаем canvas
      const canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Сохраняем пропорции
      const aspectRatio = img.height / img.width;
      
      // Вычисляем новые размеры
      let width = maxWidth;
      let height = maxWidth * aspectRatio;
      
      // Если высота слишком большая, ограничиваем по высоте
      if (height > maxWidth * 1.5) {
        height = maxWidth * 1.5;
        width = height / aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Улучшаем качество изображения
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Рисуем изображение
      ctx.drawImage(img, 0, 0, width, height);
      
      // Конвертируем в JPEG с хорошим качеством
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = (error) => {
      console.error('Error loading image for thumbnail:', error);
      reject(error);
    };
    img.src = base64;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function downloadAttachment(attachment: Attachment): void {
  const link = document.createElement('a');
  link.href = attachment.data;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getFileFromAttachment(attachment: Attachment): Promise<File> {
  const response = await fetch(attachment.data);
  const blob = await response.blob();
  return new File([blob], attachment.name, { type: attachment.type });
}

export function isImageFile(type: string): boolean {
  return type.startsWith('image/');
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('document')) return '📘';
  if (type.includes('excel') || type.includes('sheet')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
  if (type.includes('text')) return '📄';
  return '📎';
}