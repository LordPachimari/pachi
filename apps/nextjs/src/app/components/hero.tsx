import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";

function Hero() {
  return (
    <section className="flex h-screen w-screen flex-col items-center justify-center pb-8 pt-16 md:pt-8 lg:flex-row">
      <div className="hidden py-6 md:order-1 md:block">
        <Image
          src="/assets/hero.png"
          alt="Astronaut in the air"
          loading="eager"
          width={500}
          height={500}
        />
      </div>
      <div>
        <h1 className="text-balance text-5xl font-bold lg:text-6xl lg:tracking-tight xl:text-7xl">
          Welcome to Pachi
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Pachi is a global marketplace for e-commerce. We provide a platform
          for everybody who wants sell their products to the world.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="#" size={"lg"}>
            Enter the marketplace
          </Button>
        </div>
      </div>
    </section>
  );
}

export { Hero };
