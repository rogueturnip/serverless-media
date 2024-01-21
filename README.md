# Serverless Media

This is a simple setup to do presignedurl uploads to S3 along with supporting APIs. It has the ability to getImages (both as an image or just the url) and delete images.

When an image is uploaded to the S3 bucket using the signed url (to the uploads path) an uploadImageProcessor lambda runs which will move the image to the right storage location (images/) and creates a resized image also. The data is stored in a sqlite3 database just for development purposes.

There is a build/ folder in the repo. This is the better-sqlite3 bindings to allow it to work with serverless-offline. All this should be replaced to function with a proper AWS setup and database.

```
CREATE TABLE public.user_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    original_key text NOT NULL,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resized_key text
);

ALTER TABLE ONLY public.user_images
    ADD CONSTRAINT user_images_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_images
    ADD CONSTRAINT user_images_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;
```

