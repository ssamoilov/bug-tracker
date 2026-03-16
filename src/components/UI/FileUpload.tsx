import React, { useCallback, useState } from 'react';
import { cn } from '../../utils/cn';
import { Upload, X, File as FileIcon, Image } from 'lucide-react';
import { createAttachment, formatFileSize } from '../../utils/fileUtils';
import { Attachment } from '../../types';

interface FileUploadProps {
  onFilesSelected: (files: Attachment[]) => void;
  maxFiles?: number;
  maxSize?: number; // в байтах
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
  accept = 'image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx',
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(async (fileList: FileList) => {
    setError(null);
    
    if (files.length + fileList.length > maxFiles) {
      setError(`Максимум ${maxFiles} файлов`);
      return;
    }

    const newFiles: Attachment[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (file.size > maxSize) {
        setError(`Файл ${file.name} превышает максимальный размер ${formatFileSize(maxSize)}`);
        continue;
      }

      try {
        const attachment = await createAttachment(file);
        newFiles.push(attachment);
      } catch (err) {
        console.error('Error processing file:', err);
        setError(`Ошибка при загрузке ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  }, [files, maxFiles, maxSize, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files.length) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  }, [files, onFilesSelected]);

  // Группируем файлы по типу
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  const otherFiles = files.filter(f => !f.type.startsWith('image/'));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-input',
          error && 'border-destructive bg-destructive/5'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className={cn(
            'w-10 h-10 mx-auto mb-3 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="text-sm text-foreground mb-1">
            <span className="font-semibold">Нажмите для загрузки</span> или перетащите файлы
          </p>
          <p className="text-xs text-muted-foreground">
            Поддерживаются: изображения, PDF, DOC, XLS, PPT, TXT (макс. {formatFileSize(maxSize)})
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Загруженные файлы ({files.length})
          </p>
          
          {/* Сетка для изображений */}
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Image className="w-3 h-3" /> Изображения ({imageFiles.length})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {imageFiles.map((file, index) => {
                  // Находим реальный индекс в общем массиве для правильного удаления
                  const realIndex = files.findIndex(f => f.id === file.id);
                  return (
                    <div key={file.id} className="relative group">
                      <img
                        src={file.thumbnail || file.data}
                        alt={file.name}
                        className="w-full h-16 object-cover rounded-lg border border-border group-hover:border-primary transition-colors"
                      />
                      <button
                        onClick={() => removeFile(realIndex)}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Список остальных файлов */}
          {otherFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileIcon className="w-3 h-3" /> Документы ({otherFiles.length})
              </p>
              {otherFiles.map((file) => {
                const realIndex = files.findIndex(f => f.id === file.id);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg group hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-lg">📄</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFile(realIndex)}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};