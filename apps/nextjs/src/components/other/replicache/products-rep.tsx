"use client";

import React from "react";
import { Replicache } from "replicache";

import { productsMutators } from "@pachi/api";

import { env } from "~/env.mjs";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

export default function ProductsRep() {
  const rep = ReplicacheInstancesStore((state) => state.productsRep);
  // const setRep = ReplicacheInstancesStore((state) => state.setProductsRep);
  React.useEffect(() => {
    if (rep) {
      return;
    }

    // const r = new Replicache({
    //   name: "products",
    //   licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,

    //   pushURL: `http://pachi-dev.pachimari.workers.dev/push/products`,
    //   pullURL: `http://pachi-dev.pachimari.workers.dev/pull/products`,
    //   mutators: productsMutators,
    //   pullInterval: null,
    // });

    // setRep(r);
  }, []);
  return <></>;
}
