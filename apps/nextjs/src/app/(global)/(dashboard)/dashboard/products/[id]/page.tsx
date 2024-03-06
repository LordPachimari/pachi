'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce from 'lodash.debounce'

import type {
  UpdateProductImagesOrder,
  UpdateProductPrice,
  UpdateProductVariant,
  UploadProductImages,
} from '@pachi/core'
import type { AssignProductOptionValueToVariant } from '@pachi/core/src/input-schema/product'
import { type Image, type ProductUpdates } from '@pachi/db'
import { generateId, ulid } from '@pachi/utils'

import ProductOverview from '~/app/(global)/(dashboard)/dashboard/products/_components/product-overview'
import Advanced from '~/components/templates/forms/product/advanced'
import { General } from '~/components/templates/forms/product/general'
import Organize from '~/components/templates/forms/product/organize'
import Variants from '~/components/templates/forms/product/variants'
import VariantModal from '~/components/templates/modals/variant'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { createUrl } from '~/libs/create-url'
import { ProductStore, UserStore } from '~/replicache/stores'
import { useReplicache } from '~/zustand/replicache'

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = searchParams.get('storeId')

  const { dashboardRep } = useReplicache()
  const product = ProductStore.get(dashboardRep, id)
  const store = UserStore.get(dashboardRep, storeId ?? '')

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(true)

  const closeModal = useCallback(() => {
    setIsVariantModalOpen(false)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('variantId')
    router.push(createUrl(id, newParams))
  }, [id, router, searchParams])

  const openModal = useCallback(
    ({ variantId }: { variantId: string }) => {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('variantId', variantId)
      router.push(createUrl(id, newParams))
      setIsVariantModalOpen(true)
    },
    [id, router, searchParams],
  )

  const [files, setFiles] = useState<Image[]>([])

  useEffect(() => {
    if (!storeId) router.push('/home')
  }, [router, storeId])

  const updateProduct = useCallback(
    async ({ updates }: { updates: ProductUpdates }) => {
      if (dashboardRep) {
        await dashboardRep.mutate.updateProduct({
          id,
          updates,
        })
      }
    },
    [dashboardRep, id],
  )

  const onInputChange = useCallback(
    debounce(async ({ updates }: { updates: ProductUpdates }) => {
      await updateProduct({ updates })
    }, 500),
    [updateProduct],
  )
  const updatePrice = useCallback(
    async ({ priceId, updates, variantId, productId }: UpdateProductPrice) => {
      await dashboardRep?.mutate.updateProductPrice({
        priceId,
        updates,
        variantId,
        productId,
      })
    },
    [dashboardRep],
  )
  const updateVariant = useCallback(
    async ({ updates, variantId, productId }: UpdateProductVariant) => {
      await dashboardRep?.mutate.updateProductVariant({
        updates,
        variantId,
        productId,
      })
    },
    [dashboardRep],
  )

  const uploadProductImages = useCallback(
    async ({ images, productId, variantId }: UploadProductImages) => {
      await dashboardRep?.mutate.uploadProductImages({
        images,
        productId,
        variantId,
      })
    },
    [dashboardRep],
  )
  const updateProductImagesOrder = useCallback(
    async ({ order, productId, variantId }: UpdateProductImagesOrder) => {
      await dashboardRep?.mutate.updateProductImagesOrder({
        productId,
        variantId,
        order,
      })
    },
    [dashboardRep],
  )

  const createVariant = useCallback(async () => {
    if (dashboardRep && product) {
      const variantId = generateId({ id: ulid(), prefix: 'var' })
      await dashboardRep.mutate.createProductVariant({
        variant: {
          id: variantId,
          createdAt: new Date().toISOString(),
          productId: product.id,
        },
      })
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('variantId', variantId)
      router.push(createUrl(id, newParams))
      openModal({ variantId })
    }
  }, [dashboardRep, product, id, searchParams, router, openModal])

  const onTabClick = (
    value: 'general' | 'variants' | 'organize' | 'advanced',
  ) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('q', value)
    router.push(createUrl(id, newParams))
  }
  const onOptionValueChange = useCallback(
    async ({
      optionValueId,
      prevOptionValueId,
      productId,
      variantId,
    }: AssignProductOptionValueToVariant) => {
      await dashboardRep?.mutate.assignProductOptionValueToVariant({
        optionValueId,
        ...(prevOptionValueId && { prevOptionValueId }),
        productId,
        variantId,
      })
    },
    [dashboardRep],
  )

  const variantId = searchParams.get('variantId')
  const variant = product?.variants?.find((variant) => variant.id === variantId)

  return (
    <>
      {variantId && variant && product && store && (
        <VariantModal
          updatePrice={updatePrice}
          updateVariant={updateVariant}
          uploadProductImages={uploadProductImages}
          variant={variant}
          images={[]}
          options={product.options ?? []}
          productId={product.id}
          currencies={store.currencies ?? []}
          storeId={store.id}
          closeModal={closeModal}
          isOpen={isVariantModalOpen}
          updateProductImagesOrder={updateProductImagesOrder}
          onOptionValueChange={onOptionValueChange}
        />
      )}
      <div className="flex h-full w-full flex-col-reverse  md:flex-row ">
        <section className="static flex h-full w-full max-w-[1020px]  flex-col items-center border-r lg:fixed lg:w-[450px]">
          <Tabs
            aria-label="Stages"
            className="m-0 w-11/12 pt-4"
            defaultValue={searchParams.get('q') ?? 'general'}
          >
            <TabsList className=" grid w-full grid-cols-4 border-b">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.title}
                  value={tab.title}
                  onClick={() => onTabClick(tab.title)}
                >
                  {tab.title[0]!.toUpperCase() + tab.title.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent
              key="general"
              title="General"
              value="general"
              className=" w-full  "
            >
              <ScrollArea className="h-product-input">
                {product && store && (
                  <General
                    product={product}
                    onInputChange={onInputChange}
                    updateProduct={updateProduct}
                    updatePrice={updatePrice}
                    updateVariant={updateVariant}
                    files={files}
                    setFiles={setFiles}
                    uploadProductImages={uploadProductImages}
                    store={store}
                    updateProductImagesOrder={updateProductImagesOrder}
                  />
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent key="variants" value="variants">
              <ScrollArea className="h-product-input ">
                <Variants
                  productId={id}
                  options={product?.options ?? []}
                  variants={product?.variants ?? []}
                  createVariant={createVariant}
                  openVariantModal={openModal}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent key="organize" value="organize">
              <ScrollArea className="h-product-input  ">
                <Organize
                  onInputChange={onInputChange}
                  productId={id}
                  productTags={product?.tags ?? []}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent key="advanced" value="advanced">
              <ScrollArea className="h-product-input  ">
                {product?.variants?.[0] && (
                  <Advanced
                    variant={product.variants[0]}
                    updateVariant={updateVariant}
                  />
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className=" flex h-[55px]  w-full items-center justify-end border-t p-4">
            <Button size="sm" className="shadow-rose-500/5">
              Next
            </Button>
          </div>
        </section>
        <section className="flex h-full w-full  flex-col  gap-4 lg:ml-[450px] 2xl:flex-row ">
          {/* <Gallery images={files} /> */}
          <ProductOverview />
        </section>
      </div>
    </>
  )
}
const tabs: { title: 'general' | 'variants' | 'organize' | 'advanced' }[] = [
  {
    title: 'general',
  },
  {
    title: 'variants',
  },
  {
    title: 'organize',
  },
  {
    title: 'advanced',
  },
]
