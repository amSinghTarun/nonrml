import { supabase } from "./connect"

export const uploadToBucketFolder = async(destination:string, file:File, productImage?: boolean) => {
    const uploadedFile = await supabase().storage.from(productImage ? process.env.SUPABASE_PRODUCT_IMAGE_BUCKET_NAME : process.env.SUPABASE_IMAGE_BUCKET_NAME).upload(destination, file);
    return uploadedFile;
}

export const getPublicURLOfImage = (fileName: string, productImage: boolean) =>{
    const data = supabase().storage.from(productImage ? process.env.SUPABASE_PRODUCT_IMAGE_BUCKET_NAME : process.env.SUPABASE_IMAGE_BUCKET_NAME).getPublicUrl(fileName)
    return data;
}