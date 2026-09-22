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
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      } else {
        // Not on the homepage (e.g. the /services page) — the booking
        // form only lives there, so navigate to it instead of no-oping.
        window.location.href = "/#contact";
      }
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
