import React, { useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { UploadImagesProps } from "@pachi/api/src/types/mutators";
import type { Image } from "@pachi/db";

import type { OurFileRouter } from "~/app/api/uploadthing/core";
// import { generateReactHelpers } from "@uploadthing/react/hooks";

// import type { Image, Image as ImageType } from "@acme/types";

import { FileUpload } from "~/components/molecules/file-upload";
import { LargeFirstTile } from "~/components/templates/dnd-kit/sortable/large-first-tile";

// import type { OurFileRouter } from "~/app/api/uploadthing/core";
// import { ReplicacheInstancesStore } from "~/zustand/replicache";

export interface MediaFormType {
  images: Image[];
}

interface Props {
  images: Image[] | undefined;
  product_id: string;
  variant_id: string;
  files: Image[];
  setFiles: React.Dispatch<React.SetStateAction<Image[]>>;
  uploadProductImages: (props: UploadImagesProps["args"]) => Promise<void>;
}

const Media = ({
  product_id,
  variant_id,
  images,
  files,
  setFiles,
  uploadProductImages,
}: Props) => {
  const { useUploadThing } = generateReactHelpers<OurFileRouter>();
  const { isUploading, startUpload } = useUploadThing("imageUploader", {
    onUploadProgress: (p) => console.log("p", p),
    onUploadBegin: (name) => console.log("name", name),
    onClientUploadComplete: (res) => {
      console.log("res", res);
    },
  });
  useEffect(() => {
    if (images) {
      setFiles(images);
    }
  }, [images, setFiles]);

  return (
    <div className="w-full">
      <DndContext>
        <FileUpload
          id={product_id}
          setFiles={setFiles}
          uploadProductImages={uploadProductImages}
          product_id={product_id}
          variant_id={variant_id}
          startUpload={startUpload}
        />
        {files && files.length > 0 && (
          <div className="py-2">
            <div className="gap-y-2x small flex flex-col">
              {files && <LargeFirstTile items={files} />}
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
};

export default Media;
