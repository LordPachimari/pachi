import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";

function Hero() {
  return (
    <section className="flex h-screen w-screen flex-col items-center justify-center px-4 pt-10 sm:px-14 md:pt-8 lg:flex-row lg:pt-16">
      <div className="py-6 lg:order-1">
        <Image
          src="/assets/hero.png"
          alt="Astronaut in the air"
          loading="eager"
          width={500}
          height={500}
        />
      </div>
      <div>
        <h1 className="text-balance text-center text-5xl font-bold lg:text-left lg:text-6xl lg:tracking-tight xl:text-7xl">
          Welcome to{" "}
          <span className="text-balance bg-gradient-to-b from-brand-5 to-brand-7 bg-clip-text text-5xl font-bold text-transparent lg:text-6xl lg:tracking-tight xl:text-7xl">
            Pachi
          </span>
        </h1>
        <p className="my-8 max-w-xl text-center text-lg  text-slate-600 lg:text-left">
          Pachi is a global marketplace for communities. We provide a platform
          for <span className="font-extrabold">anyone</span> who wants sell
          products to the world!
        </p>
        <div className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Button className="max-w-[400px]" href="#" size={"lg"}>
            Enter marketplace
          </Button>
        </div>
      </div>
    </section>
  );
}

export { Hero };
