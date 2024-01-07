import { BUCKET } from "../../config";
import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: BUCKET, // Name of the S3 bucket
        event: "s3:ObjectCreated:*", // Trigger on any object creation
        rules: [
          {
            prefix: "uploads/", // Trigger when objects are uploaded to uploads/ folder
          },
        ],
      },
    },
  ],
};
