import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { api } from "@/trpc/react";
import Autoplay from "embla-carousel-autoplay";

export function CarouselAds() {

  const { data, isLoading, isError } = api.global.ads.useQuery();

  const images = useMemo(() => (data ? data : []), [data]);

  if (isLoading) return <div className="text-center">Loading...</div>;

  if (isError) return <div className="text-center text-red-500">Error loading images</div>;

  return (
    <Carousel opts={{loop: true}} 
    plugins={[
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true
      }),
    ]}
    className="w-full max-w-4xl">
      <CarouselContent>
            {images.map((imageUrl, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center w-full h-full p-0">
                              <img
                  src={imageUrl}
                  alt={`Advertisement Slide ${index + 1}`}
                  className="h-[200px] w-[1000px] object-cover rounded-lg"
                  loading="lazy"
                />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
                ))}
      </CarouselContent>
    </Carousel>
  );
}
