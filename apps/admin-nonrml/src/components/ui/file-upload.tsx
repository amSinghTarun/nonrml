import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDropzone } from "react-dropzone";
import { convertFileToDataURL } from "@nonrml/common";

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
  onChange: ( fileUrl: string|null) => void,
}

export const FileUpload : React.FC<FileUploadProps> = ({ onChange }) => {

  const [file, setFile] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (newFiles: File[]) => {
    if(/^image\//.test(newFiles[0].type)){
      console.log(newFiles[0])
      //Array.from(["image/jpg", "image/jpeg", "image/png", "image/webp"]).findIndex((element) => element == newFiles[0].type) >= 0
      setFile(newFiles[0]);
      let fileData = await convertFileToDataURL(newFiles[0])
      onChange(fileData);
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange
  });

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
          onChange={(e) => {
            handleFileChange(Array.from(e.target.files || []))
          }}
          className="hidden"
        />
        <div className="flex flex-col">
          <div className="relative w-full ">
            {file && (
                <motion.div
                  layoutId={"file-upload"}
                  className={cn(
                    "relative overflow-hidden text-xs  bg-white/40  flex flex-col items-start justify-start p-1 px-2 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                <div className="flex flex-row items-center w-full justify-between text-neutral-600 dark:text-neutral-400">
                  <div className="flex flex-col justify-between w-full items-center gap-1">
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className=" text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >IMAGE</motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1.5 py-0.5 rounded-md"
                    > {file.type} </motion.p>

                  </div>
                  <button className="bg-stone-700 text-white rounded-xl justify-between items-end"
                    onClick={(e) => {
                      setFile(undefined)
                      onChange(null)
                    }}
                  >
                    <DeleteOutlineIcon className="text-white p-1 text-xs"/>
                  </button>
                </div>
                </motion.div>
              )}

            {!file && (
              <motion.div
                layoutId={`file-upload`}
                variants={mainVariant}
                onClick={handleClick}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "z-40 bg-white/40 text-xs flex items-center justify-center h-8 w-full mx-auto rounded-md hover:bg-black hover:text-white",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                  </motion.p>
                ) : (
                  "Upload An Image"
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};