"use client";

import { useGenerator } from "@/lib/store/generator-store";
import { GeneratorService } from "@/lib/services/generator-service";
import { toast } from "sonner";
import { Sparkles, Download } from "lucide-react";

export function Controls() {
  const { state, setLoading, setError, addGeneration } = useGenerator();

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const seed =
        Date.now().toString() + Math.random().toString(36).substring(2, 11);
      const result = await GeneratorService.generate({ seed });
      addGeneration(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      setError(message);
      toast.error(message);
    }
  };

  const handleDownload = async () => {
    if (!state.currentGeneration) return;
    try {
      await GeneratorService.downloadComposite(state.currentGeneration);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Download failed";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={state.isLoading}
          className="bg-[#121212] rounded-full h-[64px] px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors flex items-center gap-3"
        >
          <Sparkles size={24} className="text-[#f0f0f0]" />
          <span className="font-pt-serif font-bold text-[#f0f0f0] text-[20px] sm:text-[24px]">
            {state.isLoading ? "Generating..." : "Get Enlightened"}
          </span>
        </button>

        {state.currentGeneration && !state.isLoading && (
          <button
            onClick={handleDownload}
            className="bg-[#f0f0f0] text-[#161616] rounded-full h-[64px] px-6 cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 border border-[rgba(0,0,0,0.1)]"
            aria-label="Download composite image"
          >
            <Download size={20} />
            <span className="font-pt-serif font-bold text-[18px]">Download</span>
          </button>
        )}
      </div>

      {state.error && (
        <div className="text-center text-destructive text-sm font-pt-serif">
          {state.error}
        </div>
      )}
    </div>
  );
}
