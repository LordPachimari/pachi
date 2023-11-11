"use client";

import { useEffect, useState, type FC } from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

import type { Image as ImageType } from "@pachi/db";

import { Button } from "~/components/atoms/button";

interface GalleryProps {
  images: ImageType[];
}

const Gallery: FC<GalleryProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNext = () =>
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);

  const handlePrev = () =>
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );

  const isPhoneScreen = width < 540;
  const isSmallScreen = width < 780;
  // const isMediumScreen = width > 780 && width < 1024; // Example Breakpoint. Adjust as needed
  const positionMultiplier = isSmallScreen ? 20 : 60; // Closer on small screens

  const visibleCards = isPhoneScreen ? 1 : 3;

  const adjacentCards = (visibleCards - 1) / 2;

  return (
    <div className="relative flex h-full w-full flex-col items-center  justify-center overflow-hidden">
      <div className="relative  flex h-fit min-h-[600px] w-full justify-center overflow-hidden p-4">
        {images.map((image, index) => {
          let offset = index - activeIndex;
          if (offset > Math.floor(images.length / 2)) offset -= images.length;
          if (offset < -Math.floor(images.length / 2)) offset += images.length;

          const isActive = offset === 0;
          const position = offset * positionMultiplier;
          const opacity =
            Math.abs(offset) <= adjacentCards || isActive
              ? "opacity-100"
              : "opacity-0";
          const scale = Math.max(0.7, 1 - 0.1 * Math.abs(offset));
          const zIndex = isActive ? 10 : 10 - Math.abs(offset);

          return (
            <div
              key={index}
              className={`absolute h-5/6 max-h-[600px] min-h-[500px] w-full min-w-[300px] max-w-[500px] p-4 transition-all duration-500 ease-in-out sm:w-4/5 ${opacity}`}
              style={{
                left: "50%",
                transform: `translateX(-50%) scale(${scale}) translateX(${position}px)`,
                zIndex: zIndex,
              }}
            >
              <Image
                src={image.url}
                alt={image.name}
                width={600}
                height={500}
                className="flex h-full items-center  justify-center rounded-2xl bg-white p-4 shadow-lg dark:bg-black"
              />
            </div>
          );
        })}
      </div>

      <div className="absolute  z-30 flex h-[600px] w-full items-center justify-center gap-24 ">
        <Button
          size="icon"
          onClick={handlePrev}
          className="   rounded-md bg-slate-4 px-3 py-2 text-white backdrop-blur-md hover:bg-slate-5"
        >
          <ArrowLeftIcon />
        </Button>

        <Button
          size="icon"
          onClick={handleNext}
          className=" rounded-md bg-slate-4 px-3 py-2 text-white backdrop-blur-md hover:bg-slate-5"
        >
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
};

export default Gallery;
