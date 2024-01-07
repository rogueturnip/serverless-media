import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { db } from "@libs/database";
import { s3Config } from "src/config";

const s3Client = new S3Client(s3Config);

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { id = null, imageId = null } = {} } = event;
  try {
    const image = await db
      .selectFrom("media")
      .select(["id", "original_key", "resized_key", "status", "created_by"])
      .where("id", "=", imageId)
      .where("created_by", "=", parseInt(id))
      .executeTakeFirst();

    if (!image) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Image not found" }),
      };
    }

    const deleteOrigObjectParams = {
      Bucket: process.env.BUCKET,
      Key: image.original_key,
    };

    const command = new DeleteObjectCommand(deleteOrigObjectParams);
    await s3Client.send(command);
    if (image.resized_key) {
      const deleteResizedObjectParams = {
        Bucket: process.env.BUCKET,
        Key: image.resized_key,
      };
      const command = new DeleteObjectCommand(deleteResizedObjectParams);
      await s3Client.send(command);
    }

    await db
      .deleteFrom("media")
      .where("created_by", "=", parseInt(id))
      .where("id", "=", imageId)
      .execute();

    return {
      statusCode: 202,
      body: JSON.stringify({ message: "Image deleted" }),
    };
  } catch (error) {
    console.log("Error getting image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error getting image" }),
    };
  }
};
