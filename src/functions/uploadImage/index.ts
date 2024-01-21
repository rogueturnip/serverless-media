import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        // id (created_by) is in the path parameter for simplicity
        // you probably want this from the authorizer instead and
        // pass it down in the context
        path: "/images/upload",
      },
    },
  ],
};
