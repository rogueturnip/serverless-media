import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { db } from "@libs/database";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Config } from "src/config";

const s3Client = new S3Client(s3Config);

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { imageId = null } = {} } = event;
  const { queryStringParameters } = event;
  const {
    original = null,
    resized = null,
    url = null,
  } = queryStringParameters || {};
  try {
    if (original !== null && resized !== null) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Cannot specify both original and resized",
        }),
      };
    }
    const image = await db
      .selectFrom("user_images")
      .select(["id", "original_key", "resized_key", "created_by"])
      .where("id", "=", imageId)
      .where("building_id", "=", process.env.BUILDINGID)
      .executeTakeFirst();
    console.log("image", image);
    let image_key = image.resized_key || image.original_key;
    if (original === "true") {
      image_key = image.original_key;
    }
    if (resized === "true") {
      image_key = image.resized_key;
    }

    const getObjectParams = {
      Bucket: process.env.BUCKET,
      Key: image_key,
    };
    // this is for fetching the signed url if the application
    // doesn't just want the image data
    if (url === "true") {
      const command = new GetObjectCommand(getObjectParams);
      const imageUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          imageUrl,
          imageId,
        }),
      };
    }

    const command = new GetObjectCommand(getObjectParams);
    const response = await s3Client.send(command);

    if (response.Body) {
      const bodyStream = response.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];
      for await (const chunk of bodyStream) {
        chunks.push(chunk as Buffer);
      }

      const buffer = Buffer.concat(chunks);
      const contentType = response.ContentType || "application/octet-stream";

      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "max-age:3600",
        },
        body: buffer.toString("base64"),
        isBase64Encoded: true,
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Object not found" }),
    };
  } catch (error) {
    console.log("Error getting image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
