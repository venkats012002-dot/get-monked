"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { GeneratorState, GenerationResult } from "../types";

type GeneratorAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_GENERATION"; payload: GenerationResult }
  | { type: "SET_CURRENT_GENERATION"; payload: GenerationResult | null }
  | { type: "RESTORE_GENERATION"; payload: GenerationResult };

const initialState: GeneratorState = {
  isLoading: false,
  error: null,
  history: [],
  currentGeneration: null,
};

function generatorReducer(
  state: GeneratorState,
  action: GeneratorAction,
): GeneratorState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "ADD_GENERATION": {
      const newHistory = [action.payload, ...state.history].slice(0, 12);
      return {
        ...state,
        history: newHistory,
        currentGeneration: action.payload,
        isLoading: false,
        error: null,
      };
    }
    case "SET_CURRENT_GENERATION":
      return { ...state, currentGeneration: action.payload };
    case "RESTORE_GENERATION":
      return { ...state, currentGeneration: action.payload };
    default:
      return state;
  }
}

interface GeneratorContextType {
  state: GeneratorState;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addGeneration: (generation: GenerationResult) => void;
  setCurrentGeneration: (generation: GenerationResult | null) => void;
  restoreGeneration: (generation: GenerationResult) => void;
}

const GeneratorContext = createContext<GeneratorContextType | undefined>(
  undefined,
);

export function GeneratorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(generatorReducer, initialState);

  const value: GeneratorContextType = {
    state,
    setLoading: (loading) => dispatch({ type: "SET_LOADING", payload: loading }),
    setError: (error) => dispatch({ type: "SET_ERROR", payload: error }),
    addGeneration: (g) => dispatch({ type: "ADD_GENERATION", payload: g }),
    setCurrentGeneration: (g) =>
      dispatch({ type: "SET_CURRENT_GENERATION", payload: g }),
    restoreGeneration: (g) =>
      dispatch({ type: "RESTORE_GENERATION", payload: g }),
  };

  return (
    <GeneratorContext.Provider value={value}>
      {children}
    </GeneratorContext.Provider>
  );
}

export function useGenerator() {
  const ctx = useContext(GeneratorContext);
  if (!ctx)
    throw new Error("useGenerator must be used within a GeneratorProvider");
  return ctx;
}
