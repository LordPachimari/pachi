"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageHeaderHeading } from "~/components/molecules/page-header";
import { Shell } from "~/components/ui/shell";
import { useQueryOptions } from "~/routing/router";
import { ProductsTable } from "./_components/table";

const Page = () => {
  const searchParams = useSearchParams();

  const { page, per_page, status, title } = useQueryOptions(searchParams);
  const pageAsNumber = page[0] ? Number(page[0]) : 1;
  const fallbackPage = isNaN(pageAsNumber) ? 1 : pageAsNumber;
  const perPageAsNumber = per_page[0] ? Number(per_page[0]) : 10;
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

  const storeId = searchParams.get("storeId");
  const router = useRouter();
  const statusSet = new Set(status);

  useEffect(() => {
    if (!storeId) router.push("/");
  }, [router, storeId]);

  if (!storeId) return <></>;

  return (
    <Shell>
      <PageHeaderHeading size="sm" className="mt-2 flex-1">
        Products
      </PageHeaderHeading>
      <ProductsTable
        perPage={fallbackPerPage}
        page={fallbackPage}
        status={statusSet}
        title={title[0] ?? ""}
        storeId={storeId}
      />
    </Shell>
  );
};

export default Page;
