import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeInMB?: number;
  className?: string;
  previewUrl?: string | null;
  onClearFile?: () => void;
}

export function FileUpload({
  onFileSelected,
  acceptedFileTypes = "image/*",
  maxSizeInMB = 5,
  className,
  previewUrl,
  onClearFile,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`File size must be less than ${maxSizeInMB}MB`);
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Call the callback
    onFileSelected(file);
  };

  const handleClearFile = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClearFile) {
      onClearFile();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        id="file-upload"
      />
      
      {!preview ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center border-dashed"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 mb-2" />
          <span>Upload File</span>
          <span className="text-xs text-muted-foreground mt-1">
            Max {maxSizeInMB}MB
          </span>
        </Button>
      ) : (
        <div className="relative w-full h-32 rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover" 
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleClearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}