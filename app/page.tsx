import { Toaster } from "@/components/ui/sonner";
import { GeneratorProvider } from "@/lib/store/generator-store";
import { Header } from "@/components/Header";
import { GeneratorCard } from "@/components/GeneratorCard";
import { Controls } from "@/components/Controls";
import { HistoryRail } from "@/components/HistoryRail";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <GeneratorProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 space-y-8">
          <GeneratorCard />
          <Controls />
          <HistoryRail />
        </main>
        <Footer />
        <Toaster />
      </div>
    </GeneratorProvider>
  );
}
