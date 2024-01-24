import type { Store } from "@pachi/db";

import { PageHeaderHeading } from "~/components/molecules/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { EditStoreButton } from "./_components/edit-store-button";
import { Products } from "./_components/products";

export default function StorePage({
  params,
}: {
  params: {
    name: string;
  };
}) {
  const name = params.name;
  const store: Store = {
    id: "m1e",
    name: "me",
    createdAt: "2023-11-21T12:34:56Z",
    founderId: "m1e",
    version: 0,
  };
  return (
    <section className="relative">
      <StoreCard store={store} />
      <div className="h-[400px] w-full border-b bg-red-50  dark:bg-red-200"></div>
      <div className="w-full p-4 md:p-10">
        <PageHeaderHeading size="sm" className="my-2 mb-4 flex-1">
          Products
        </PageHeaderHeading>
        <Products />
      </div>
    </section>
  );
}
function StoreCard({ store }: { store: Store }) {
  return (
    <Card className="absolute left-1/2 top-2 flex max-h-[350px] min-h-[300px] w-[300px] -translate-x-1/2 transform flex-col items-center  justify-center rounded-2xl bg-component p-0 drop-shadow-sm dark:border dark:border-slate-8 md:top-10   md:w-[600px]">
      <EditStoreButton storeName={store.name} />

      <CardContent className="flex h-full  w-full flex-col p-0 pt-8  md:flex-row">
        <section className="flex h-full w-full  items-center justify-center md:w-[250px]">
          <Avatar className="h-36 w-36 md:h-48 md:w-48 ">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </section>
        <section className="relative h-full w-full p-4  md:w-[350px] md:p-0 ">
          <h1 className="line-clamp-2 flex-grow  text-2xl font-bold leading-none tracking-tight">
            Pachi
          </h1>
          <h2 className="py-1 text-slate-11">@Pachi</h2>
          <h2 className="line-clamp-4  leading-none tracking-tight">
            About the store
          </h2>
        </section>
      </CardContent>
      <CardFooter className=" flex h-10 w-full p-0">
        <div className="h-10 w-full md:w-[250px]" />
        <div className="relative h-10 w-full md:w-[350px]">
          <span className="absolute bottom-2 ">
            <h2 className="text-slate-11">Joined 1 January 2024</h2>
            <h2 className="flex gap-[3px] text-[14px] text-slate-11">
              <p className="font-bold text-black dark:text-white">0</p>{" "}
              followers
            </h2>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
