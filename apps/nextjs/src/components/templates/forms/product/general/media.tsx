import React, { useCallback, useEffect } from 'react'
import { DndContext } from '@dnd-kit/core'
import { generateReactHelpers } from '@uploadthing/react/hooks'

import type { UpdateProductImagesOrder, UploadProductImages } from '@pachi/core'
import type { Image } from '@pachi/db'

import type { OurFileRouter } from '~/app/api/uploadthing/core'
import { FileUpload } from '~/components/molecules/file-upload'
import { LargeFirstTile } from '~/components/templates/dnd-kit/sortable/large-first-tile'

export interface MediaFormType {
  images: Image[]
}

interface Props {
  images: Image[] | undefined
  productId: string
  variantId: string
  files: Image[]
  setFiles: React.Dispatch<React.SetStateAction<Image[]>>
  uploadProductImages: (props: UploadProductImages) => Promise<void>
  updateProductImagesOrder: (props: UpdateProductImagesOrder) => Promise<void>
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
  const { useUploadThing } = generateReactHelpers<OurFileRouter>()
  const { startUpload } = useUploadThing('imageUploader', {
    onUploadProgress: (p) => console.log('p', p),
  })
  useEffect(() => {
    if (images) {
      setFiles(images.toSorted((a, b) => a.order - b.order))
    }
  }, [images, setFiles])
  const updateImagesOrder = async ({
    order,
  }: {
    order: Record<string, number>
  }) => {
    await updateProductImagesOrder({
      order,
      productId,
      variantId,
    })
  }

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
                  updateImagesOrder={updateImagesOrder}
                />
              )}
            </div>
          </div>
        )}
      </DndContext>
    </div>
  )
}

export default Media
