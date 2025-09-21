import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MyTripsProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyTrips: React.FC<MyTripsProps> = ({ isOpen, onClose }) => {
  const trips = [
    {
      id: 1,
      title: "Winter Magic in Landour's Misty Hills",
      image: "/api/placeholder/60/60", // You can replace with actual trip image
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={onClose}
      />
      
      {/* My Trips Popup */}
      <div className="fixed left-16 top-0 h-full w-80 bg-background/95 backdrop-blur-md border border-border z-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">My Trips</h2>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-muted rounded-md"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Trips List */}
        <div className="p-4">
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                {trip.image ? (
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-muted-foreground text-sm">✈️</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm leading-tight">
                    {trip.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State or Add New Trip */}
          {trips.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✈️</span>
              </div>
              <p className="text-muted-foreground text-sm">No trips yet</p>
              <p className="text-muted-foreground text-xs mt-1">
                Create your first trip to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyTrips;