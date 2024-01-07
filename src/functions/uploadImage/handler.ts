import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ZodError, z } from "zod";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Config } from "src/config";
import { v4 as uuidv4 } from "uuid";

const querySchema = z.object({
  filetype: z.enum(["jpg", "png", "gif"]),
});

const s3Client = new S3Client(s3Config);

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters } = event;
  const { id = null } = event.pathParameters || {};
  const queryValidation = querySchema.safeParse(queryStringParameters || {});
  if (!queryValidation.success) {
    const error = queryValidation as { success: false; error: ZodError };
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.error.issues }),
    };
  }
  // id is used to group the files by a user or some other
  // identifier. It is not used to store the file name.
  const { filetype } = queryStringParameters;

  const mimeType = `image/${filetype.toLowerCase()}`;
  const imageId = uuidv4();
  const key = `uploads/${id}/${imageId}-original.${filetype}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: key,
      ContentType: mimeType,
      Metadata: {
        "image-id": imageId,
        "created-by": id,
      },
    });
    const uploadURL = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadURL,
        imageId,
      }),
    };
  } catch (error) {
    console.log("Error generating signed URL", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error generating signed URL" }),
    };
  } finally {
  }
};
