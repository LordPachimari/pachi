"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash.debounce";
import { useSubscribe } from "replicache-react";

import type {
  UpdatePriceProps,
  UpdateProductVariantProps,
  UploadImagesProps,
} from "@pachi/api";
import {
  UpdateProductSchema,
  type Image,
  type Product,
  type ProductUpdates,
  type Store,
} from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import Gallery from "~/app/(main)/(dashboard)/dashboard/products/_components/Gallery";
import { Button } from "~/components/atoms/button";
import { ScrollArea } from "~/components/atoms/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/atoms/tabs";
import Advanced from "~/components/templates/forms/product/advanced";
import { General } from "~/components/templates/forms/product/general";
import Organize from "~/components/templates/forms/product/organize";
import Variants from "~/components/templates/forms/product/variants";
import VariantModal from "~/components/templates/modals/variant";
import ProductOverview from "~/components/templates/product-overview/product-overview";
import { createUrl } from "~/libs/create-url";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const store_id = searchParams.get("store_id");

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(true);

  const closeModal = useCallback(() => {
    setIsVariantModalOpen(false);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("variantId");
    router.push(createUrl(id, newParams));
  }, [id, router, searchParams]);

  const openModal = useCallback(
    ({ variantId }: { variantId: string }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("variantId", variantId);
      router.push(createUrl(id, newParams));
      setIsVariantModalOpen(true);
    },
    [id, router, searchParams],
  );
  console.log("store_id", store_id);

  const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);

  const [files, setFiles] = useState<Image[]>([]);
  const product = useSubscribe(
    dashboardRep,
    async (tx) => {
      const product = (await tx.get(id)) as Product | undefined;
      console.log("product", product);
      return product;
    },
    undefined,
    [id],
  );

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    const local_store_id = localStorage.getItem("store_id");
    if (!store_id && !user_id) router.push("/");
    if (!local_store_id && store_id) localStorage.setItem("store_id", store_id);
  }, [router, store_id]);
  const store = useSubscribe(
    globalRep,
    async (tx) => {
      const store = store_id
        ? ((await tx.get(store_id)) as Store | undefined)
        : undefined;
      const stores = await tx.scan({ prefix: "store" }).entries().toArray();
      console.log("stores", stores);
      console.log("store", store);
      return store;
    },
    undefined,
    [store_id],
  );

  const updateProduct = useCallback(
    async ({ updates }: { updates: ProductUpdates }) => {
      if (dashboardRep) {
        UpdateProductSchema._parse({ id, updates });
        await dashboardRep.mutate.updateProduct({
          args: {
            id,
            updates,
          },
        });
      }
    },
    [dashboardRep, id],
  );

  const onInputChange = useCallback(
    debounce(async ({ updates }: { updates: ProductUpdates }) => {
      await updateProduct({ updates });
    }, 500),
    [updateProduct],
  );
  const updatePrice = useCallback(
    async ({
      money_amount_id,
      updates,
      variant_id,
      product_id,
    }: UpdatePriceProps["args"]) => {
      await dashboardRep?.mutate.updatePrice({
        args: {
          money_amount_id,
          updates,
          variant_id,
          product_id,
        },
      });
    },
    [dashboardRep],
  );
  const updateVariant = useCallback(
    async ({
      updates,
      variant_id,
      product_id,
    }: UpdateProductVariantProps["args"]) => {
      await dashboardRep?.mutate.updateProductVariant({
        args: {
          updates,
          variant_id,
          product_id,
        },
      });
    },
    [dashboardRep],
  );

  const uploadProductImages = useCallback(
    async (props: UploadImagesProps["args"]) => {
      await dashboardRep?.mutate.uploadProductImages({
        args: {
          product_id: props.product_id,
          images: props.images,
          variant_id: props.product_id,
        },
      });
    },
    [dashboardRep],
  );

  const createVariant = useCallback(async () => {
    if (dashboardRep && product) {
      const variantId = generateId({ id: ulid(), prefix: "var" });
      await dashboardRep.mutate.createProductVariant({
        args: {
          variant: {
            id: variantId,
            created_at: new Date().toISOString(),
            product_id: product.id,
            inventory_quantity: 0,
          },
        },
      });
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("variantId", variantId);
      router.push(createUrl(id, newParams));
      openModal({ variantId });
    }
  }, [dashboardRep, product, id, searchParams, router, openModal]);

  const onTabClick = (
    value: "general" | "variants" | "organize" | "advanced",
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("q", value);
    router.push(createUrl(id, newParams));
  };

  const variant_id = searchParams.get("variantId");
  const variant = product?.variants?.find(
    (variant) => variant.id === variant_id,
  );
  console.log("store currencies", store?.currencies);
  console.log("is it true", !!(variant_id && variant && product && store));

  return (
    <>
      {variant_id && variant && product && store && (
        <VariantModal
          updatePrice={updatePrice}
          updateVariant={updateVariant}
          uploadProductImages={uploadProductImages}
          variant={variant}
          images={[]}
          options={product.options ?? []}
          product_id={product.id}
          currencies={store.currencies ?? []}
          storeId={store.id}
          closeModal={closeModal}
          isOpen={isVariantModalOpen}
        />
      )}
      <div className="flex h-full w-full flex-col-reverse  md:flex-row ">
        <section className="static flex h-full w-full max-w-[1020px]  flex-col items-center border-r lg:fixed lg:w-[400px]">
          <Tabs
            aria-label="Stages"
            className="m-0 w-11/12 pt-4"
            defaultValue={searchParams.get("q") ?? "general"}
          >
            <TabsList className=" grid w-full grid-cols-4 border-b">
              <TabsTrigger
                value="general"
                onClick={() => onTabClick("general")}
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="variants"
                onClick={() => onTabClick("variants")}
              >
                Variants
              </TabsTrigger>
              <TabsTrigger
                value="organize"
                onClick={() => onTabClick("organize")}
              >
                Organize
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                onClick={() => onTabClick("advanced")}
              >
                Advanced
              </TabsTrigger>
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
                  />
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent key="variants" value="variants">
              <ScrollArea className="h-product-input ">
                <Variants
                  product_id={id}
                  options={product?.options ?? []}
                  variants={product?.variants ?? []}
                  createVariant={createVariant}
                  openVariantModal={openModal}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent key="organize" value="organize">
              <ScrollArea className="h-product-input  ">
                <Organize />
              </ScrollArea>
            </TabsContent>
            <TabsContent key="advanced" value="advanced">
              <ScrollArea className="h-product-input  ">
                <Advanced />
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className=" flex h-[55px]  w-full items-center justify-end border-t p-4">
            <Button size="sm" className="shadow-rose-500/5">
              Next
            </Button>
          </div>
        </section>
        <section className="flex h-full w-full  flex-col  gap-4 lg:ml-[400px] 2xl:flex-row ">
          <Gallery images={files} />
          <ProductOverview />
        </section>
      </div>
    </>
  );
}
