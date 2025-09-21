import React from "react";
import { X, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/contexts/TripsContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { geminiService } from "@/lib/gemini";
import { firebaseChatService } from "@/lib/firebaseService";

interface MyTripsProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyTrips: React.FC<MyTripsProps> = ({ isOpen, onClose }) => {
  const { getRecentTrips, deleteTrip, saveTrip } = useTrips();
  const navigate = useNavigate();
  const trips = getRecentTrips(10);

  // Save current chat before creating new one
  const saveCurrentChat = async () => {
    try {
      const currentChatId = sessionStorage.getItem('currentChatId');
      if (!currentChatId) return;

      // Get current chat data
      const tripContext = JSON.parse(sessionStorage.getItem(`tripContext_${currentChatId}`) || '{}');
      const messages = JSON.parse(sessionStorage.getItem(`messages_${currentChatId}`) || '[]');
      const tripData = JSON.parse(localStorage.getItem(`tripData_${currentChatId}`) || '{}');

      // Only save if there are meaningful messages (more than just initial greeting)
      if (messages.length <= 1) return;

      // Generate title using Gemini
      let title = 'My Trip';
      try {
        const chatSummary = messages.map(msg => `${msg.sender}: ${msg.text || msg.content}`).join('\n');
        title = await geminiService.generateChatTitle({
          ...tripContext,
          chatSummary
        });
      } catch (error) {
        console.error('Failed to generate chat title:', error);
        // Fallback title
        if (tripContext.destination) {
          title = `${tripContext.destination} Trip`;
        }
      }

      // Save the trip to local storage
      saveTrip({
        chatId: currentChatId,
        title,
        destinations: tripData.destinations || [],
        startDate: tripContext.startDate || new Date().toISOString(),
        endDate: tripContext.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        travelers: tripContext.travelers || 1,
        preferences: tripData.preferences || [],
        chatData: { tripContext, messages }
      });

      // Also save to Firebase
      try {
        await firebaseChatService.saveChat({
          id: currentChatId,
          chatId: currentChatId,
          title,
          tripContext,
          messages,
          preferences: tripData.preferences || [],
          destinations: tripData.destinations || [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (firebaseError) {
        console.error('Failed to save to Firebase:', firebaseError);
      }

      console.log('Current chat saved successfully');
    } catch (error) {
      console.error('Error saving current chat:', error);
    }
  };

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
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group border border-border/50"
                onClick={async () => {
                  try {
                    // Load chat data from Firebase
                    const chatData = await firebaseChatService.getChat(trip.chatId);
                    if (chatData) {
                      // Restore chat state
                      sessionStorage.setItem('currentChatId', trip.chatId);
                      sessionStorage.setItem(`tripContext_${trip.chatId}`, JSON.stringify(chatData.tripContext));
                      sessionStorage.setItem(`messages_${trip.chatId}`, JSON.stringify(chatData.messages));
                      localStorage.setItem(`tripData_${trip.chatId}`, JSON.stringify({
                        preferences: chatData.preferences,
                        destinations: chatData.destinations
                      }));
                      localStorage.setItem('selectedPreferences', JSON.stringify(chatData.preferences));
                    }
                    navigate(`/chat/${trip.chatId}`);
                    onClose();
                  } catch (error) {
                    console.error('Error loading chat:', error);
                    navigate(`/chat/${trip.chatId}`);
                    onClose();
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✈️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-1">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{trip.destinations.length} destinations</span>
                    <Users className="w-3 h-3 ml-2" />
                    <span>{trip.travelers} travelers</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTrip(trip.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
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
              <Button 
                onClick={async () => {
                  // Save current chat before creating new one
                  await saveCurrentChat();
                  
                  const newChatId = uuidv4();
                  sessionStorage.setItem('currentChatId', newChatId);
                  // Clear any existing chat data for fresh start
                  sessionStorage.removeItem(`tripContext_${newChatId}`);
                  sessionStorage.removeItem(`messages_${newChatId}`);
                  localStorage.removeItem(`tripData_${newChatId}`);
                  localStorage.removeItem('initialTripDescription');
                  navigate(`/chat/${newChatId}`);
                  onClose();
                }}
                className="mt-4"
              >
                Start New Trip
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyTrips;