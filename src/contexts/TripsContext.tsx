import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SavedTrip {
  id: string;
  chatId: string;
  title: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  travelers: number;
  preferences: any[];
  createdAt: string;
  updatedAt: string;
  chatData?: any; // Store the full chat data for title generation
}

interface TripsContextType {
  trips: SavedTrip[];
  saveTrip: (trip: Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => SavedTrip | undefined;
  getRecentTrips: (limit?: number) => SavedTrip[];
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};

interface TripsProviderProps {
  children: ReactNode;
}

export const TripsProvider = ({ children }: TripsProviderProps) => {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    // Load trips from localStorage
    const savedTrips = localStorage.getItem('savedTrips');
    if (savedTrips) {
      try {
        const parsedTrips = JSON.parse(savedTrips);
        setTrips(parsedTrips);
      } catch (error) {
        console.error('Failed to load saved trips:', error);
      }
    }
  }, []);

  const saveTrip = (tripData: Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrip: SavedTrip = {
      ...tripData,
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTrips = [newTrip, ...trips].slice(0, 10); // Keep only 10 most recent
    setTrips(updatedTrips);
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
  };

  const deleteTrip = (id: string) => {
    const updatedTrips = trips.filter(trip => trip.id !== id);
    setTrips(updatedTrips);
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
  };

  const getTrip = (id: string) => {
    return trips.find(trip => trip.id === id);
  };

  const getRecentTrips = (limit: number = 10) => {
    return trips.slice(0, limit);
  };

  return (
    <TripsContext.Provider value={{
      trips,
      saveTrip,
      deleteTrip,
      getTrip,
      getRecentTrips,
    }}>
      {children}
    </TripsContext.Provider>
  );
};
