"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface BookingContextValue {
  /** Currently preset service name for the booking form's <select>. */
  selectedService: string;
  /** Set the preset service, then smooth-scroll the page to #contact. */
  presetService: (name: string) => void;
  setSelectedService: (name: string) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState("");

  const presetService = useCallback((name: string) => {
    setSelectedService(name);
    if (typeof document !== "undefined") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const value = useMemo(
    () => ({ selectedService, presetService, setSelectedService }),
    [selectedService, presetService]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
