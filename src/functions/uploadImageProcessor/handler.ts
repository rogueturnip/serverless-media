import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3Event, S3Handler } from "aws-lambda";

import { Readable } from "stream";
import { db } from "@libs/database";

const sharp = require("sharp");

const s3Config = process.env.IS_OFFLINE
  ? {
      forcePathStyle: true,
      credentials: {
        accessKeyId: "S3RVER", // This specific key is required when working offline
        secretAccessKey: "S3RVER",
      },
      endpoint: "http://localhost:4569",
    }
  : { region: process.env.REGION };

const s3Client = new S3Client(s3Config);

const isImage = (filename: string) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "heif"];
  const extension = filename.split(".").pop().toLowerCase();
  return imageExtensions.includes(extension);
};

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

const moveObject = async (
  bucket: string,
  sourceKey: string,
  destinationKey: string
) => {
  // Copy the object to the new location
  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destinationKey,
      })
    );
  } catch (error) {
    console.error("Error copying object", error);
    throw error;
  }
  // Delete the original object
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: sourceKey,
      })
    );
  } catch (error) {
    console.error("Error deleting object", error);
    throw error;
  }
};

export const main: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const originalKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    if (isImage(originalKey)) {
      try {
        await moveObject(
          bucket,
          originalKey,
          originalKey.replace("uploads", "images")
        );
        const getObjectResponse = await s3Client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: originalKey.replace("uploads", "images"),
          })
        );
        const body = getObjectResponse.Body as Readable;
        const metadata = getObjectResponse.Metadata;
        await db
          .insertInto("media")
          .values({
            id: metadata["image-id"],
            created_by: parseInt(metadata["created-by"]),
            original_key: originalKey.replace("uploads", "images"),
            resized_key: null,
            status: "active",
          })
          .execute();

        const buffer = await streamToBuffer(body);

        const resizedImage = await sharp(buffer)
          .resize({ width: 512 }) // Set the desired width or height
          .toBuffer();

        const resizedKey = originalKey
          .replace("original", "resized")
          .replace("uploads", "images");
        console.log("resizedKey", resizedKey);

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: resizedKey,
            Body: resizedImage,
            ContentType: `image/${resizedKey.split(".").pop().toLowerCase()}`, // Adjust content type based on your requirements
            Metadata: metadata,
          })
        );
        await db
          .updateTable("media")
          .set({ resized_key: resizedKey })
          .where("id", "=", metadata["image-id"])
          .execute();
      } catch (error) {
        console.error("Error processing file", originalKey, error);
      }
    } else {
      console.log("Uploaded file is not an image:", originalKey);
    }
  }
};
