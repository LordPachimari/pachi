import * as React from "react";
import {
  useDropzone,
  type Accept,
  type FileRejection,
  type FileWithPath,
} from "react-dropzone";
import { toast } from "sonner";
import { ulid } from "ulid";
import type { UploadFileResponse } from "uploadthing/client";

import type { UploadImagesProps } from "@pachi/api/src/types/mutators";
import type { Image } from "@pachi/db";
import { cn, formatBytes, generateId } from "@pachi/utils";

import { Icons } from "../atoms/icons";

// FIXME Your proposed upload exceeds the maximum allowed size, this should trigger toast.error too

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: Accept;
  productId: string;
  variantId: string;
  maxSize?: number;
  maxFiles?: number;
  setFiles: React.Dispatch<React.SetStateAction<Image[]>>;
  isUploading?: boolean;
  disabled?: boolean;
  startUpload: (
    files: File[],
    input?: undefined,
  ) => Promise<UploadFileResponse<null>[] | undefined>;
  uploadProductImages: (props: UploadImagesProps["args"]) => Promise<void>;
}

export function FileUpload({
  productId,
  variantId,
  accept = {
    "image/*": [],
  },
  maxSize = 1024 * 1024 * 8,
  maxFiles = 10,
  setFiles,
  isUploading = false,
  disabled = false,
  className,
  startUpload,
  uploadProductImages, // updateProductImages,
}: FileUploadProps) {
  const onDrop = React.useCallback(
    async (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      const files = acceptedFiles.map((file, index) => {
        const newFile: Image = {
          id: generateId({ id: ulid(), prefix: "image" }),
          url: URL.createObjectURL(file),
          order: index,
          altText: file.name,
        };
        setFiles((prev) => [...(prev ?? []), newFile]);
        return newFile;
      });

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ errors }) => {
          if (errors[0]?.code === "file-too-large") {
            toast.error(
              `File is too large. Max size is ${formatBytes(maxSize)}`,
            );
            return;
          }
          errors[0]?.message && toast.error(errors[0].message);
        });
      }
      try {
        const uploadedFiles = await startUpload(acceptedFiles).then((res) => {
          const formattedImages = res?.map((image, index) => ({
            id: files[index]!.id,
            altText: image.key.split("_")[1] ?? image.key,
            url: image.url,
            order: index,
          }));
          return formattedImages ?? null;
        });
        if (uploadedFiles) {
          await uploadProductImages({
            productId,
            images: uploadedFiles,
            variantId,
          });
        }
      } catch (error) {
        console.log(error);
      }
    },

    [maxSize, setFiles, startUpload, uploadProductImages],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple: maxFiles > 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative grid h-28 w-full  cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 px-5 py-2.5 text-center transition hover:bg-muted/25",
        "ring-offset-background focus-visible:outline-none  focus-visible:outline-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ",
        isDragActive && "border-brand",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="group grid w-full place-items-center gap-1 sm:px-10">
          <Icons.upload
            className="h-9 w-9 animate-pulse text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      ) : isDragActive ? (
        <div className="grid  place-items-center gap-2 text-muted-foreground sm:px-5">
          <Icons.upload
            className={cn("h-8 w-8", isDragActive && "animate-bounce")}
            aria-hidden="true"
          />
          <p className="text-sm font-medium">Drop the file here</p>
        </div>
      ) : (
        <div className="grid place-items-center gap-1 sm:px-5 ">
          <Icons.upload className="h-8 w-8 text-slate-9" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium text-slate-9">
            Drag {`'n'`} drop file here, or click to select file
          </p>
          {/* <p className="text-sm text-slate-500">
            Please upload file with size less than {formatBytes(maxSize)}
          </p> */}
        </div>
      )}
    </div>
  );
}
