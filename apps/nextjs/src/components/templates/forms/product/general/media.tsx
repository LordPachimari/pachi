import React, { useCallback, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type {
  UpdateImagesOrderProps,
  UploadImagesProps,
} from "@pachi/api/src/types/mutators";
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
  productId: string;
  variantId: string;
  files: Image[];
  setFiles: React.Dispatch<React.SetStateAction<Image[]>>;
  uploadProductImages: (props: UploadImagesProps["args"]) => Promise<void>;
  updateProductImagesOrder: ({
    order,
    productId,
    variantId,
  }: UpdateImagesOrderProps["args"]) => Promise<void>;
}

const Media = ({
  productId,
  variantId,
  images,
  files,
  setFiles,
  uploadProductImages,
  updateProductImagesOrder,
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
      setFiles(images.toSorted((a, b) => a.order - b.order));
    }
  }, [images, setFiles]);
  const updateProductImagesOrder_ = useCallback(
    async ({ order }: { order: Record<string, number> }) => {
      if (productId && variantId) {
        await updateProductImagesOrder({
          order,
          productId,
          variantId,
        });
      }
    },
    [],
  );
  console.log("files", files);

  return (
    <div className="w-full">
      <DndContext>
        <FileUpload
          id={productId}
          setFiles={setFiles}
          uploadProductImages={uploadProductImages}
          productId={productId}
          variantId={variantId}
          startUpload={startUpload}
        />
        {files && files.length > 0 && (
          <div className="py-2">
            <div className="gap-y-2x small flex flex-col">
              {files && (
                <LargeFirstTile
                  items={files}
                  updateProductImagesOrder={updateProductImagesOrder_}
                />
              )}
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
};

export default Media;
