import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Heart, ThumbsUp, ThumbsDown, Undo } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: "I'm Travion, your personal AI travel agent. Simply describe your trip and I will create a fully personalized dream vacation for you planned to the last detail - flights, hotels and day-by-day plans.\n\nYour perfect vacation is seconds away — what's on your mind?"
    },
    {
      type: "user", 
      content: "ahmedabad to manali for 5 people and for 7 days"
    },
    {
      type: "ai",
      content: "Manali sounds amazing for your group of 5! The hill station will be a refreshing escape from Ahmedabad's heat. When are you planning to travel? I'll need the dates to create the perfect 7-day itinerary for you."
    },
    {
      type: "user",
      content: "in october any time"
    },
    {
      type: "ai", 
      content: "Perfect! October is ideal for Manali - crisp mountain air and stunning autumn colors await your group. Here are some incredible experiences to consider for your 7-day adventure:"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { type: "user", content: newMessage }]);
      setNewMessage("");
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: "ai", 
          content: "I'm processing your request and will create the perfect itinerary for you..."
        }]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Chat Area */}
      <div className="flex flex-col min-h-screen lg:ml-0">
        <div className="flex-1 lg:pl-4">{/* Sidebar spacing for desktop */}
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 pb-24">{/* Added bottom padding for mobile input */}
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 lg:gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
                  <AvatarFallback className={message.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-orange-500 text-white'}>
                    {message.type === 'ai' ? 'T' : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-xs sm:max-w-md lg:max-w-2xl ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 lg:p-4 rounded-2xl text-sm lg:text-base ${
                    message.type === 'ai' 
                      ? 'bg-card border border-border text-card-foreground' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  
                  {message.type === 'ai' && index === messages.length - 1 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-9 lg:w-9">
                        <ThumbsUp className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-9 lg:w-9">
                        <ThumbsDown className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Skip Step Button */}
            <div className="flex justify-center lg:justify-end px-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 rounded-full"
                onClick={() => window.location.href = '/preferences'}
              >
                Skip this step
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Input Area - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 lg:relative lg:border-t lg:p-6 lg:bg-transparent lg:backdrop-blur-none">
            <div className="flex items-center gap-2 lg:gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask Travion..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="pr-12 rounded-full h-11 lg:h-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 lg:h-9 lg:w-9"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="hidden lg:flex">
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button variant="ghost" size="sm" className="lg:hidden h-11 w-11">
                <Undo className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Travion is in beta and can make mistakes. Please check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;