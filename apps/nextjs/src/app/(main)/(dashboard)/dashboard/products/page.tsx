"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubscribe } from "replicache-react";
import { ulid } from "ulid";

import type { Product } from "@pachi/db";
import { generateId } from "@pachi/utils";

import { Shell } from "~/components/atoms/shell";
import { PageHeaderHeading } from "~/components/molecules/page-header";
import { Table } from "~/components/templates/tables/products-table";
import { createUrl } from "~/libs/create-url";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

const Page = () => {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const router = useRouter();
  const createProduct = useCallback(async () => {
    console.log("on create product", storeId, dashboardRep);
    if (dashboardRep && storeId) {
      const id = generateId({
        id: ulid(),
        prefix: "p",
        filterId: storeId,
      });
      await dashboardRep.mutate.createProduct({
        args: {
          product: {
            id,
            createdAt: new Date().toISOString(),
            status: "draft",
            discountable: true,
            storeId,
          },
          defaultVariantId: generateId({
            id: ulid(),
            prefix: "var",
          }),
        },
      });
      router.push(createUrl(`/dashboard/products/${id}`, searchParams));
    }
  }, [dashboardRep, router, storeId, searchParams]);
  const products = useSubscribe(
    dashboardRep,
    async (tx) => {
      const products = (await tx
        .scan({ prefix: "p_" })
        .values()
        .toArray()) as Product[];
      return products;
    },
    [],
  );

  console.log("products", products);
  useEffect(() => {
    if (!storeId) router.push("/");
  }, [router, storeId]);

  return (
    <Shell>
      <PageHeaderHeading size="sm" className="mt-2 flex-1">
        Products
      </PageHeaderHeading>
      <Table data={products} createProduct={createProduct} />
    </Shell>
  );
};

export default Page;
