import { useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import { Upload, FileText, Image, X, Eye } from 'lucide-react';
import type { UploadedFile } from '../../types/consultationForm.types';

interface FileUploadZoneProps {
  files: UploadedFile[];
  onAdd: (files: UploadedFile[]) => void;
  onRemove: (id: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
}

export function FileUploadZone({
  files,
  onAdd,
  onRemove,
  accept = '.pdf,.jpg,.jpeg,.png,.xlsx,.xls',
  maxSizeMB = 10,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];
      Array.from(fileList).forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) return; // skip oversized
        const uploadedFile: UploadedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString(),
        };
        // Generate preview for images
        if (file.type.startsWith('image/')) {
          uploadedFile.preview_url = URL.createObjectURL(file);
        }
        newFiles.push(uploadedFile);
      });
      if (newFiles.length > 0) onAdd(newFiles);
    },
    [onAdd, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer',
          'border-border-strong hover:border-brand-primary hover:bg-brand-primary/5',
          'transition-all duration-200 group'
        )}
      >
        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
          <Upload className="w-5 h-5 text-brand-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-display font-medium text-text-primary">
            Drop files here or <span className="text-brand-primary">browse</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            PDF, JPG, PNG, XLSX — max {maxSizeMB}MB per file
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-bg-input rounded-md border border-border-subtle group"
            >
              <div className="w-9 h-9 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                {getFileIcon(file.type)}
              </div>
              {file.preview_url && (
                <img
                  src={file.preview_url}
                  alt={file.name}
                  className="w-9 h-9 rounded-md object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">{file.name}</p>
                <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {file.preview_url && (
                  <button
                    type="button"
                    onClick={() => window.open(file.preview_url, '_blank')}
                    className="p-1.5 rounded-md text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="p-1.5 rounded-md text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
