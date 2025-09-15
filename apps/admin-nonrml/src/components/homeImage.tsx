/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit, Check, X } from "lucide-react";
import { FileUpload } from "@nonrml/components";
import Image from "next/image";
import { convertFileToDataURL } from "@nonrml/common";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";

type HomePageImagesData = UseTRPCQueryResult<RouterOutput["viewer"]["homeImages"]["getHomeImagesAdmin"], unknown>;

export const HomePageImagesManager = ({ images }: { images: HomePageImagesData }) => {
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);  // Changed to array
  const [legacyType, setLegacyType] = useState<"TOP_MD" | "TOP_LG" | "TOP_2_MD" | "TOP_2_LG" | "MIDDLE_MD" | "MIDDLE_LG" | "BOTTOM">("TOP_MD");
  const [imageDetails, setImageDetails] = useState<{ 
    [imageId: number]: { 
      currentType?: "TOP_MD" | "TOP_LG" | "TOP_2_MD" | "TOP_2_LG" | "MIDDLE_MD" | "MIDDLE_LG" | "BOTTOM", 
      active?: boolean 
    } 
  }>({});

  // tRPC mutations
  const createImage = trpc.viewer.homeImages.uploadImage.useMutation({
    onSuccess: () => {
      setUploadedFiles([]);  // Reset to empty array
      setLegacyType("TOP_MD");
      setShowUploadForm(false);
      images.refetch()
    }
  });
  const updateImage = trpc.viewer.homeImages.editImage.useMutation({
    onSuccess: () => {
      setEditingImage(null);
      images.refetch()
    }
  });
  const deleteImage = trpc.viewer.homeImages.deleteImage.useMutation({
    onSuccess: () => {
      images.refetch()
    }
  });

  // Handle file uploads from FileUpload component
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  // Handle file deletion from FileUpload component
  const handleFileDelete = (index: number) => {
    // The FileUpload component handles the file removal internally
    // and calls onUpload with the updated files array
  };

  // Handle image upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (uploadedFiles.length === 0) {
        throw new Error("Image is a required prop");
      }
      
      // Use the first file from the uploaded files array
      const fileToUpload = uploadedFiles[0];
      
      await createImage.mutateAsync({
        image: await convertFileToDataURL(fileToUpload),
        legacyType,
      });
    } catch (error) {
      setError(error);
    }
  };

  // Delete image
  const handleDelete = async (imageId: number, active: boolean) => {
    if(active) {setError("Cannot delete an active image"); return};
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      setError(null);
      await deleteImage.mutateAsync({ id: imageId });
    } catch (error) {
      setError(error);
    }
  };

  // Start editing an image
  const startEditing = (image: any) => {
    setEditingImage(image.id);
    setImageDetails(() => ({
      [image.id]: {
        currentType: image.currentType,
        active: image.active
      }
    }));
  };

  // Update image details
  const updateHomeImage = async (imageId: number) => {
    try {
      setError(null);
      if (imageDetails[imageId]) {
        await updateImage.mutateAsync({
          id: imageId,
          currentType: imageDetails[imageId].currentType,
          active: imageDetails[imageId].active
        });
      }
    } catch (error) {
      setError(error);
    }
  };

  // Handle image detail changes
  const handleImageDetailsChange = ({ 
    imageId, 
    currentType, 
    active 
  }: { 
    imageId: number, 
    currentType?: "TOP_MD" | "TOP_LG" | "TOP_2_MD" | "TOP_2_LG" | "MIDDLE_MD" | "MIDDLE_LG" | "BOTTOM", 
    active?: boolean 
  }) => {
    try {
      setError(null);
      setImageDetails((prev) => {
        const prevImageDetails = { 
          [imageId]: {
            ...prev[imageId],
            ...(currentType && { "currentType": currentType }),
            ...(active !== undefined && { "active": active })
          }
        };
        
        return { ...prev, ...prevImageDetails };
      });
    } catch (error) {
      setError(error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingImage(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Home Page Images</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          disabled={createImage.isLoading}
        >
          {showUploadForm ? "Cancel Upload" : "Upload New Image"}
        </button>
      </div>

      {error && (
        <div className="absolute z-40 backdrop-blur-sm w-full h-full justify-center p-5">
          <div className="relative bg-red-600 bg-opacity-70 text-white rounded-xl p-3 justify-center">
            <button onClick={() => setError(null)} className="absolute text-black top-1 right-1">X</button>
            <span>{`${error}`}</span>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="mt-4">
              <label className="block mb-1">Upload Image:</label>
              <FileUpload 
                onUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                buttonClass="bg-blue-600 hover:bg-blue-700"
                maxFiles={1}  // Limit to 1 file since we only process one image
              />
              {uploadedFiles.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  File selected: {uploadedFiles[0].name}
                </p>
              )}
            </div>
            
            <div className="mt-4">
              <label className="block mb-1">Legacy Type:</label>
              <select
                value={legacyType}
                onChange={(e) => setLegacyType(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="TOP_MD">TOP_MD</option>
                <option value="TOP_LG">TOP_LG</option>
                <option value="TOP_2_MD">TOP_2_MD</option>
                <option value="TOP_2_LG">TOP_2_LG</option>
                <option value="MIDDLE_MD">MIDDLE_MD</option>
                <option value="MIDDLE_LG">MIDDLE_LG</option>
                <option value="BOTTOM">BOTTOM</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                The current type will be automatically set to the same value
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                disabled={createImage.isLoading || uploadedFiles.length === 0}
              >
                {createImage.isLoading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Images Table */}
      <Table className={`${error && "backdrop-blur-lg"}`}>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer bg-amber-400 hover:bg-stone-700 hover:text-white">ID</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Legacy Type</TableHead>
            <TableHead>Current Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {
          images.data?.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                No images found
              </TableCell>
            </TableRow>
          ) : (
            images.data?.data.map((image) => (
              <TableRow key={image.id}>
                <TableCell>
                  { (updateImage.isLoading && updateImage.variables?.id === image.id) ? "Updating" : image.id }
                </TableCell>
                <TableCell>
                  {image.imageUrl ? (
                    <Image 
                      src={image.imageUrl} 
                      alt="Home page image"
                      width={100}
                      height={100}
                      className="h-12 w-24 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell>{image.legacyType}</TableCell>
                <TableCell>
                  {editingImage === image.id ? (
                    <select
                      value={imageDetails[image.id]?.currentType || image.currentType}
                      onChange={(e) => handleImageDetailsChange({
                        imageId: image.id,
                        currentType: e.target.value as any
                      })}
                      className="bg-gray-100 p-2 border rounded"
                    >
                      <option value="TOP_MD">TOP_MD</option>
                      <option value="TOP_LG">TOP_LG</option>
                      <option value="TOP_2_MD">TOP_2_MD</option>
                      <option value="TOP_2_LG">TOP_2_LG</option>
                      <option value="MIDDLE_MD">MIDDLE_MD</option>
                      <option value="MIDDLE_LG">MIDDLE_LG</option>
                      <option value="BOTTOM">BOTTOM</option>
                    </select>
                  ) : (
                    image.currentType
                  )}
                </TableCell>
                <TableCell>
                  {editingImage === image.id ? (
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={imageDetails[image.id]?.active !== undefined ? imageDetails[image.id].active : image.active}
                        onChange={(e) => handleImageDetailsChange({
                          imageId: image.id,
                          active: e.target.checked
                        })}
                        className="mr-2 form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>Active</span>
                    </div>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${image.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {image.active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </TableCell>
                <TableCell>{new Date(image.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{image.updatedAt ? new Date(image.updatedAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell className="text-xs text-white flex gap-2">
                  {editingImage === image.id ? (
                    <>
                      <button
                        onClick={() => updateHomeImage(image.id)}
                        className="p-2 bg-green-600 rounded-md hover:bg-green-500"
                        disabled={updateImage.isLoading}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 bg-gray-600 rounded-md hover:bg-gray-500"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(image)}
                        className="p-2 bg-blue-600 rounded-md hover:bg-blue-500"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id, image.active)}
                        className="p-2 bg-red-600 rounded-md hover:bg-red-500"
                        disabled={deleteImage.isLoading && deleteImage.variables?.id === image.id}
                      >
                        {deleteImage.isLoading && deleteImage.variables?.id === image.id ? "..." : <Trash2 size={16} />}
                      </button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )
        }
        </TableBody>
      </Table>
    </div>
  );
};

export default HomePageImagesManager;