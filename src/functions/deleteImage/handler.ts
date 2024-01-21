import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { db } from "@libs/database";
import { s3Config } from "src/config";

const s3Client = new S3Client(s3Config);

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { imageId = null } = {} } = event;
  try {
    const image = await db
      .selectFrom("user_images")
      .select(["id", "original_key", "resized_key", "created_by"])
      .where("id", "=", imageId)
      .where("building_id", "=", process.env.BUILDINGID)
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
      .deleteFrom("user_images")
      .where("id", "=", imageId)
      .where("building_id", "=", process.env.BUILDINGID)
      .execute();

    return {
      statusCode: 202,
      body: JSON.stringify({ message: "Image deleted" }),
    };
  } catch (error) {
    console.log("Error getting image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
