"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useGenerator } from "@/lib/store/generator-store";
import { ImageWithFallback } from "./ImageWithFallback";

export function GeneratorCard() {
  const { state } = useGenerator();
  const [imageError, setImageError] = useState(false);

  const { currentGeneration, isLoading, error } = state;

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden bg-transparent rounded-[32px] gap-0 border-0 p-0">
      <div className="aspect-square relative rounded-[32px] overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center bg-destructive/10 text-destructive p-8 text-center">
            <div>
              <p className="mb-2 font-pt-serif">
                Oops! The monkeys are on break.
              </p>
              <p className="text-sm opacity-75 font-pt-serif">{error}</p>
            </div>
          </div>
        ) : currentGeneration ? (
          <>
            <ImageWithFallback
              src={currentGeneration.imageUrl}
              alt={currentGeneration.alt}
              className="w-full h-full object-cover transition-opacity duration-500"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />

            <div className="absolute inset-0 flex items-end justify-center p-6">
              <div className="p-4 max-w-[95%]">
                <p className="text-white text-center font-bold sm:text-[36px] leading-[1.2] text-[20px] font-pt-serif [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]">
                  {currentGeneration.quote}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-muted-foreground rounded-[32px] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/monke-quill.png)" }}
          >
            <div className="text-center absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-[60px] w-full px-4">
              <p className="mb-2 text-[rgba(240,240,240,1)] font-bold text-[24px] font-pt-serif">
                Ready for some existential wisdom?
              </p>
              <p className="text-sm opacity-75 font-pt-serif text-[rgba(255,255,255,1)] text-[16px]">
                Press &lsquo;Get Enlightened&rsquo; to begin your journey.
              </p>
            </div>
          </div>
        )}

        {imageError && currentGeneration && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
            <p>Image failed to load</p>
          </div>
        )}
      </div>
    </Card>
  );
}
