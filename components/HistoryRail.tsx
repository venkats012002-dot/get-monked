"use client";

import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useGenerator } from "@/lib/store/generator-store";
import { ImageWithFallback } from "./ImageWithFallback";

export function HistoryRail() {
  const { state, restoreGeneration } = useGenerator();

  if (state.history.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="mb-3 text-center text-[rgba(51,51,51,1)] font-pt-serif">
        Recent Generations
      </h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 pb-3">
          <TooltipProvider>
            {state.history.map((generation) => (
              <Tooltip key={generation.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => restoreGeneration(generation)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all hover:scale-105 ${
                      state.currentGeneration?.id === generation.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <ImageWithFallback
                      src={generation.imageUrl}
                      alt="Contemplative monkey with existential quote"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm italic">
                    &ldquo;{generation.quote}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(generation.timestamp).toLocaleTimeString()}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
}
