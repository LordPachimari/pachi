"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubscribe } from "replicache-react";
import { ulid } from "ulid";

import type { Product, Store } from "@pachi/db";
import { generateId } from "@pachi/utils";

import { Shell } from "~/components/atoms/shell";
import { PageHeaderHeading } from "~/components/molecules/page-header";
import { Table } from "~/components/templates/tables/products-table";
import { createUrl } from "~/libs/create-url";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

const Page = () => {
  const searchParams = useSearchParams();
  const store_id = searchParams.get("store_id");
  const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const router = useRouter();
  const createProduct = useCallback(async () => {
    console.log("on create product", store_id, dashboardRep);
    if (dashboardRep && store_id) {
      const id = generateId({
        id: ulid(),
        prefix: "p",
        filter_id: store_id,
      });
      await dashboardRep.mutate.createProduct({
        args: {
          product: {
            id,
            created_at: new Date().toISOString(),
            status: "draft",
            discountable: true,
            store_id,
          },
          default_variant_id: generateId({
            id: ulid(),
            prefix: "var",
          }),
        },
      });
      router.push(createUrl(`/dashboard/products/${id}`, searchParams));
    }
  }, [dashboardRep, router, store_id, searchParams]);
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
    if (!store_id) router.push("/");
  }, [router, store_id]);

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
