import { supabase } from "./connect"

export const uploadToBucketFolder = async(destination:string, file:File, productImage?: boolean) => {
    const uploadedFile = await supabase()
                                .storage
                                .from(productImage ? process.env.SUPABASE_PRODUCT_IMAGE_BUCKET_NAME : process.env.SUPABASE_IMAGE_BUCKET_NAME)
                                .upload(destination, file);
    return uploadedFile;
}

export const getSignedUrl = async(destination:string, productImage?: boolean) => {
    const signedUrl = await supabase()
                            .storage
                            .from(productImage ? process.env.SUPABASE_PRODUCT_IMAGE_BUCKET_NAME : process.env.SUPABASE_IMAGE_BUCKET_NAME)
                            .createSignedUploadUrl(destination, 120);
    return signedUrl;
}

export const getPublicURLOfImage = (fileName: string, productImage: boolean) =>{
    const data = supabase()
                    .storage
                    .from(productImage ? process.env.SUPABASE_PRODUCT_IMAGE_BUCKET_NAME : process.env.SUPABASE_IMAGE_BUCKET_NAME)
                    .getPublicUrl(fileName)
    return data;
}

export const uploadToSignedURL = (productImage: boolean, destination:string, token: string, file:File) =>{
    const data = supabase()
                    .storage
                    .from(productImage ? process.env.SUPABASE_PRODUCT_IMAGE_BUCKET_NAME : process.env.SUPABASE_IMAGE_BUCKET_NAME)
                    .uploadToSignedUrl(destination, token, file)
    console.log("upload to signed url", data);
    return data.data.path;
}