import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface SimulationContextType {
  isSimulationMode: boolean;
  toggleSimulationMode: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined,
);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [isSimulationMode, setIsSimulationMode] = useState(() => {
    const stored = localStorage.getItem("simulationMode");
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("simulationMode", String(isSimulationMode));
  }, [isSimulationMode]);

  const toggleSimulationMode = () => {
    setIsSimulationMode((prev) => !prev);
  };

  return (
    <SimulationContext.Provider
      value={{ isSimulationMode, toggleSimulationMode }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within SimulationProvider");
  }
  return context;
}
