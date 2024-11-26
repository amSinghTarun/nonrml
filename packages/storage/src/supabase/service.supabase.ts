import { supabase } from "./connect"

export const uploadToBucketFolder = async(destination:string, file:File) => {
    const uploadedFile = await supabase().storage.from(process.env.SUPABASE_IMAGE_BUCKET_NAME).upload(destination, file);
    return uploadedFile;
}

export const getPublicURLOfImage = () =>{
    const data = supabase().storage.from(process.env.SUPABASE_IMAGE_BUCKET_NAME).getPublicUrl('folder/avatar1.png')
    return data;
}