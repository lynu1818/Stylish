import productModel from "../../models/productModel.js";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import crypto from "crypto";


const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
})

const storage = multer.memoryStorage();
const upload = multer({storage:storage})




export const uploadProductImage = upload.fields([{name: 'main_image', maxCount: 1}]);


const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

export const productCreate = async (req, res) => {
    const {
        category,
        title,
        description,
        price,
        texture,
        wash,
        place,
        note,
        story,
        size,
        colorcode,
        stock
    } = req.body;
    if (!req.files) {
        return res.status(400).json({error: "No files were uploaded."});
    }
    const file = req.files['main_image'][0];
    const fileBuffer = await sharp(file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer()
    const fileName = generateFileName();

    const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: file.mimetype,
    };
    console.log(file);

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        const imagePath = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName
            }),
        )
        console.log('File uploaded to S3 successfully. Location: ', uploadResult.Location);

        const product = await productModel.createProduct(
            {
                category: category,
                title: title,
                description: description,
                price: price,
                texture: texture,
                wash: wash,
                place: place,
                note: note,
                story: story,
                size: size,
                colorcode: colorcode,
                stock: stock,
                main_image: imagePath
            }
        );

        return res.status(200).json({
            data: {
                category: category,
                title: title,
                description: description,
                price: price,
                texture: texture,
                wash: wash,
                place: place,
                note: note,
                story: story,
                size: size,
                colorcode: colorcode,
                stock: stock,
                main_image: file.originalname
            }
        });
    } catch (error) {
        console.log('Error uploading file to S3: ', error);
        return res.status(500).json({error: "Error uploading to S3"});
    }
};