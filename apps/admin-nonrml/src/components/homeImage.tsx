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
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { Trash2, Edit, Check, X } from "lucide-react";

type HomePageImagesData = UseTRPCQueryResult<RouterOutput["viewer"]["homeImages"]["getAll"], unknown>;

export const HomePageImagesManager = ({ images }: { images: HomePageImagesData }) => {
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Image details states
  const [imageUrl, setImageUrl] = useState("");
  const [legacyType, setLegacyType] = useState<"TOP_MD" | "TOP_LG" | "MIDDLE_MD" | "MIDDLE_LG" | "BOTTOM">("TOP_MD");
  const [imageDetails, setImageDetails] = useState<{ 
    [imageId: number]: { 
      currentType?: "TOP_MD" | "TOP_LG" | "MIDDLE_MD" | "MIDDLE_LG" | "BOTTOM", 
      active?: boolean 
    } 
  }>({});

  // tRPC mutations
  const createImage = trpc.viewer.homeImages.create.useMutation();
  const updateImage = trpc.viewer.homeImages.update.useMutation();
  const deleteImage = trpc.viewer.homeImages.delete.useMutation();

  // Handle image detail changes
  const handleImageDetailsChange = ({ 
    imageId, 
    currentType, 
    active 
  }: { 
    imageId: number, 
    currentType?: "TOP_MD" | "TOP_LG" | "MIDDLE_MD" | "MIDDLE_LG" | "BOTTOM", 
    active?: boolean 
  }) => {
    try {
      setError(null);
      setImageDetails((prev) => {
        let prevImageDetails = { 
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

  // Handle image upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await createImage.mutateAsync({
        imageUrl,
        legacyType,
      });
      setImageUrl("");
      setLegacyType("TOP_MD");
      setShowUploadForm(false);
      images.refetch();
    } catch (error) {
      setError(error);
    }
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
        setEditingImage(null);
        images.refetch();
      }
    } catch (error) {
      setError(error);
    }
  };

  // Delete image
  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      setError(null);
      await deleteImage.mutateAsync({ id: imageId });
      images.refetch();
    } catch (error) {
      setError(error);
    }
  };

  // Start editing an image
  const startEditing = (image: any) => {
    setEditingImage(image.id);
    setImageDetails((prev) => ({
      ...prev,
      [image.id]: {
        currentType: image.currentType,
        active: image.active
      }
    }));
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
            <div>
              <label className="block mb-1">Image URL:</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Legacy Type:</label>
              <select
                value={legacyType}
                onChange={(e) => setLegacyType(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="TOP_MD">TOP_MD</option>
                <option value="TOP_LG">TOP_LG</option>
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
                disabled={createImage.isLoading}
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
          {images.status === "success" ? (
            images.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                  No images found
                </TableCell>
              </TableRow>
            ) : (
              images.data.map((image) => (
                <TableRow key={image.id}>
                  <TableCell className="cursor-pointer hover:bg-amber-400 hover:text-white" onClick={async () => editingImage === image.id && await updateHomeImage(image.id)}>
                    {(updateImage.isLoading && updateImage.variables?.id === image.id) ? "Updating" : image.id}
                  </TableCell>
                  <TableCell>
                    {image.imageUrl ? (
                      <img 
                        src={image.imageUrl} 
                        alt="Home page image" 
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
                          onClick={() => handleDelete(image.id)}
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
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                {images.status === "loading" ? "Loading..." : "Error loading images"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HomePageImagesManager;