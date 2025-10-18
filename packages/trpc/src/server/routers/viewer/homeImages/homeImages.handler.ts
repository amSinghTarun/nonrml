import { Prisma, prisma, prismaTypes } from "@nonrml/prisma";
import { TDeleteImageSchema, TEditImageSchema, TUploadImageSchema } from "./homeImages.schema";
import { dataURLtoFile, TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { cacheServicesRedisClient } from "@nonrml/cache";
import { getPublicURLOfImage, getSignedUrl, uploadToBucketFolder } from "@nonrml/storage";
import { TRPCError } from "@trpc/server";
import { TAddProductImageSchema, TGetSignedUrlSchema} from "./homeImages.schema";

export const getHomeImages = async ({ctx, input}: TRPCRequestOptions<{}>) => {
    const prisma = ctx.prisma;
    try{
        const homeImages = await prisma.homePageImages.findMany({
            where: {
                active: true
            }
        });

        let homeImagesJson: Record<keyof typeof prismaTypes.HomeImageType | 'BOTTOM', string | string[]> = {
            BOTTOM: [],
            TOP_MD: "",
            TOP_LG: "",
            TOP_2_MD: "",
            TOP_2_LG: "",
            MIDDLE_LG: "",
            MIDDLE_MD: ""
        };
        for(let image of homeImages){
            if(image.currentType === "BOTTOM"){
                // Type assertion to tell TypeScript that BOTTOM is an array
                (homeImagesJson["BOTTOM"] as string[]).push(image.imageUrl);
            } else {
                homeImagesJson = {
                    ...homeImagesJson,
                    [image.currentType]: image.imageUrl
                }
            }
        }
        await cacheServicesRedisClient().set("homeImages", JSON.stringify(homeImagesJson));
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: homeImagesJson};
    } catch(error) {
        //console.log("\n\n Error in getInventory----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        }
        throw TRPCCustomError(error);
    } 

}

export const getHomeImagesAdmin = async ({ctx, input}: TRPCRequestOptions<{}>)  => {
    const prisma = ctx.prisma;;
    try{
        const homeImages = await prisma.homePageImages.findMany({
            orderBy: [
                {active: "desc"}
            ]
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: homeImages};
    } catch(error) {
        //console.log("\n\n Error in getInventory----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

export const getSignedImageUploadUrl = async ({ctx, input}: TRPCRequestOptions<TGetSignedUrlSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const data = await getSignedUrl(input.imageName, true);
        console.log("signedUrl", data)
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: {signedUrl: data.data.signedUrl, token: data.data.token, path: data.data.path}};
    } catch(error) {
        //console.log("\n\n Error in addProductImage ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

export const addHomeImage = async ({ctx, input}: TRPCRequestOptions<TAddProductImageSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const {data: imageUrl} = await getPublicURLOfImage(input.imagePath, true);
        console.log(imageUrl);
        const newHomeImage = await prisma.homePageImages.create({
            data: {
                imageUrl: imageUrl.publicUrl,
                legacyType: input.legacyType,
                currentType: input.legacyType,
                active: false
            }
        });
        console.log(newHomeImage);
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: newHomeImage};
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

export const uploadImage = async ({ctx, input}: TRPCRequestOptions<TUploadImageSchema>)  => {
    const prisma = ctx?.prisma!
    input = input!;
    try{        
        const imageUploaded = await uploadToBucketFolder(
            `home/${ctx.user?.id}:${Date.now()}`,  // should a home folder be created
            dataURLtoFile(input.image, `${Date.now()}`)
        );
        
        if (imageUploaded.error) {
            console.log(imageUploaded.error)
            throw new TRPCError({ 
                code: "UNPROCESSABLE_CONTENT", 
                message: "Unable to upload image" 
            });
        }

        // Get public URL
        const { data: imageUrl } = await getPublicURLOfImage(imageUploaded.data.path, false);
        console.log(imageUrl)

        const imageUplaoded = await prisma.homePageImages.create({
            data: {
                imageUrl: imageUrl.publicUrl,
                legacyType: input.legacyType,
                currentType: input.legacyType,
                active: false
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"inventory record created", data: imageUplaoded};
    } catch(error) {
        //console.log("\n\n Error in addInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};

/*
    Edit item in images
    No need to find before update, as the error handling will tackle not found condition(P2025) while updating.
*/
export const editImage = async ({ctx, input}: TRPCRequestOptions<TEditImageSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const updateData = {
            ...("active" in input && { active : input.active }),
            ...(input.currentType && { currentType: input.currentType })
        }

        const activeImageData = await prisma.homePageImages.findUnique({
            where: {
                id: input.id
            }
        });

        if(activeImageData?.currentType == "BOTTOM" || input.currentType == "BOTTOM" && (activeImageData?.active || input.active)){
            const bottomImagesCount = await prisma.homePageImages.count({
                where: {
                    currentType: input.currentType,
                    active: true
                },
            });
            if(bottomImagesCount > 5){
                throw {code: "BAD_REQUEST", message: "AT MAX 4 IMAGES CAN BE MARKED AS BOTTOMß"}
            }
        };

        const imageUpdated = await prisma.homePageImages.update({
            where: {
                id: input.id
            },
            data: updateData,
        });

        if(imageUpdated.currentType !== "BOTTOM" ){
            await prisma.homePageImages.updateMany({
                where: {
                    id: {
                        not: input.id
                    },
                    currentType: input.currentType
                },
                data: {
                    active: false
                }
            })
        }

        await cacheServicesRedisClient().del("homeImages")

        return { status:TRPCResponseStatus.SUCCESS, message:"inventory item editted", data: {} }
    } catch(error) {
        //console.log("\n\n Error in editInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};

/*
    Delete the item from the images
*/
export const deleteImage = async ({ctx, input}: TRPCRequestOptions<TDeleteImageSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        await prisma.homePageImages.delete({
            where: {
                id: input.id,
                active: false
            }
        });
       return { status: TRPCResponseStatus.SUCCESS, message:"Image deleted successfully", data: {}};
    } catch(error) {
        //console.log("\n\n Error in deleteInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};