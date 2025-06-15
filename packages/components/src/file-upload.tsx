import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { useDropzone } from "react-dropzone";
import { cn } from "@nonrml/common"

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 0,
    y: 0,
  },
};

interface FileUploadProps {
  onUpload: (files: File[]) => void,
  onFileDelete: (index: number) => void,
  buttonClass?: string,
  maxFiles?: number
}

export const FileUpload = ({ onUpload, onFileDelete, buttonClass, maxFiles = 5 }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageFile = (file: File) => /^image\//.test(file.type);
  const isVideoFile = (file: File) => /^video\//.test(file.type);
  const isValidFileType = (file: File) => isImageFile(file) || isVideoFile(file);

  const handleFileUpload = (newFiles: File[]) => {
    const validFiles = newFiles.filter(isValidFileType);
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      const updatedFiles = [...files, ...filesToAdd];
      setFiles(updatedFiles);
      onUpload(updatedFiles);
    }

    if (validFiles.length > remainingSlots) {
      alert(`Only ${remainingSlots} more files can be added. Maximum ${maxFiles} files allowed.`);
    }

    if (newFiles.length > validFiles.length) {
      alert("Only image and video files are allowed.");
    }
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFileDelete(index);
    onUpload(updatedFiles);
  };

  const handleClick = () => fileInputRef.current?.click();

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: handleFileUpload,
    onDropRejected: (error) => {
      console.log(error);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        whileHover="animate"
        className="group/file relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => {
            handleFileUpload(Array.from(e.target.files || []))
          }}
          className="hidden"
        />
        
        <div className="flex flex-col space-y-2">
          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  layoutId={`file-upload-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "relative overflow-hidden text-xs w-full flex flex-row items-center justify-between p-2 px-3 border border-neutral-200 rounded-md",
                    "shadow-sm bg-white"
                  )}
                >
                  <div className="flex flex-row items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {isImageFile(file) ? (
                        <ImageIcon className="text-blue-500 text-lg" />
                      ) : (
                        <VideoLibraryIcon className="text-purple-500 text-lg" />
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0 flex-1">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neutral-700 font-medium truncate"
                      >
                        {file.name}
                      </motion.p>
                      
                      <div className="flex flex-row items-center space-x-2 text-neutral-500">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs"
                        >
                          {file.type}
                        </motion.p>
                        <span>•</span>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs"
                        >
                          {formatFileSize(file.size)}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex-shrink-0 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(index);
                    }}
                  >
                    <DeleteOutlineIcon className="text-sm" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {files.length < maxFiles && (
            <motion.div
              layoutId="file-upload-area"
              variants={mainVariant}
              onClick={handleClick}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={cn(
                "z-40 text-xs flex flex-col items-center justify-center p-4 w-full mx-auto rounded-md hover:underline font-light text-white cursor-pointer hover:bg-neutral-900 bg-neutral-800 border-2 border-dashed border-neutral-600",
                buttonClass
              )}
            >
              {isDragActive ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-neutral-300 flex flex-col items-center"
                >
                  <p>Drop files here</p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-xs text-neutral-400 text-center">
                    {files.length}/{maxFiles} files • Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-neutral-500 text-center">
                    Supports: JPG, PNG, WebP, MP4, MOV, AVI
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Max files reached message */}
          {files.length >= maxFiles && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-center text-neutral-500 p-2 bg-neutral-100 rounded-md"
            >
              Maximum {maxFiles} files uploaded. Delete some files to add more.
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};