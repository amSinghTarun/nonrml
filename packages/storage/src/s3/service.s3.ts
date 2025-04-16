import { getS3Connection } from "./connect"

export const uploadObject = (destination: string, file: File,  productImage?: boolean) => {
    const s3Connection = getS3Connection();
    s3Connection.putObject({
        Bucket: productImage ? process.env.CLOUDFLARE_PRODUCT_IMAGE_BUCKET! : process.env.CLOUDFLARE_IMAGE_BUCKET!,
        Key: destination,
        Body: file
    })
}

export const getObject = () => {

}