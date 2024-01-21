import type { AWS } from "@serverless/typescript";
import { BUCKET } from "./src/config";
import deleteImage from "@functions/deleteImage";
import getImage from "@functions/getImage";
import imageProcessor from "@functions/uploadImageProcessor";
import uploadImage from "@functions/uploadImage";

const serverlessConfiguration: AWS = {
  service: "serverless-media",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline", "serverless-s3-local"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      REGION: "us-east-1",
      DATABASE_URL: "postgres://postgres:example@localhost:5555/alana",
      SPID: "bb198d37-0f47-4cf7-8488-e930a439a92c",
      BUILDINGID: "aeff3511-0e86-499a-8f2e-85c2a8b7cbd8",
      USERID: "0c542d90-2d9a-4920-8c76-9277e313e5e9",
      BUCKET,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: { uploadImage, deleteImage, imageProcessor, getImage },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    s3: {
      host: "localhost",
      directory: "/tmp/s3",
    },
  },
  resources: {
    Resources: {
      Bucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: BUCKET,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
