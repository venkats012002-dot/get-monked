export interface GenerationResult {
  id: string;
  imageUrl: string;
  quote: string;
  alt: string;
  timestamp: number;
}

export interface GeneratorState {
  isLoading: boolean;
  error: string | null;
  history: GenerationResult[];
  currentGeneration: GenerationResult | null;
}

export interface GenerateRequest {
  seed: string;
}

export interface GenerateResponse {
  imageUrl: string;
  quote: string;
  alt: string;
}
