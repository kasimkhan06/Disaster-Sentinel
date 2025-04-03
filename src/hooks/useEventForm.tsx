import { createContext, useContext, useState, useEffect } from "react";

interface EventFormState {
  name: string;
  date: string;
  time: string;
  eventType: string;
  category: string;
}

interface EventFormContextType {
  formState: EventFormState;
  updateFormState: (newState: Partial<EventFormState>) => void;
  resetFormState: () => void;
}

const defaultState: EventFormState = {
  name: "",
  date: "",
  time: "",
  eventType: "",
  category: "",
};

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

export function EventFormProvider({ children }: { children: React.ReactNode }) {
  const [formState, setFormState] = useState<EventFormState>(defaultState);

  const updateFormState = (newState: Partial<EventFormState>) => {
    setFormState((prev) => ({ ...prev, ...newState }));
  };

  const resetFormState = () => {
    setFormState(defaultState);
  };

  return (
    <EventFormContext.Provider value={{ formState, updateFormState, resetFormState }}>
      {children}
    </EventFormContext.Provider>
  );
}

export function useEventForm() {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error("useEventForm must be used within an EventFormProvider");
  }
  return context;
}
