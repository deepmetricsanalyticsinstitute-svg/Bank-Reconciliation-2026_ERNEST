import React, { useRef, useCallback } from 'react';
import { PdfIcon, ExcelIcon, UploadIcon, CsvIcon } from './icons';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  acceptedFileType: string;
  label: string;
  description: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileSelect,
  acceptedFileType,
  label,
  description,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        // Basic check for accepted file type
        const droppedFile = event.dataTransfer.files[0];
        const acceptedTypes = acceptedFileType.split(',');
        const fileExtension = '.' + droppedFile.name.split('.').pop();
        if (acceptedTypes.includes(fileExtension) || acceptedTypes.includes(droppedFile.type)) {
             onFileSelect(droppedFile);
        } else {
            // Optionally, show an error to the user
            console.error('Invalid file type dropped');
        }
    }
  }, [acceptedFileType, onFileSelect]);

  const renderFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (extension === 'pdf' || file.type === 'application/pdf') {
        return <PdfIcon />;
    }
    if (extension === 'csv' || file.type === 'text/csv') {
        return <CsvIcon />;
    }
    if (
        ['xls', 'xlsx'].includes(extension) ||
        file.type.includes('spreadsheetml') ||
        file.type.includes('excel')
    ) {
        return <ExcelIcon />;
    }
    return <UploadIcon />;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-xl font-semibold text-slate-200">{label}</h3>
      <p className="text-sm text-slate-400 mb-4">{description}</p>
      <div
        className="w-full h-48 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all duration-300"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept={acceptedFileType}
          className="hidden"
        />
        {file ? (
          <div className="text-center">
            {renderFileIcon(file)}
            <p className="mt-2 font-semibold text-slate-300">{file.name}</p>
            <p className="text-xs">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p className="mt-2">Click or drag file to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};
