import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, ChevronRight, Heart, ThumbsUp, ThumbsDown, Undo } from "lucide-react";
import { useState } from "react";

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
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-16 bg-background border-r border-border flex flex-col items-center py-4 space-y-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
          <span className="text-white text-sm">T</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">👤</span>
        </div>
        <div className="flex-1" />
        <div className="space-y-2">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <span className="text-xs">ℹ️</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className="w-10 h-10">
                <AvatarFallback className={message.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-orange-500 text-white'}>
                  {message.type === 'ai' ? 'T' : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-2xl ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.type === 'ai' 
                    ? 'bg-card border border-border text-card-foreground' 
                    : 'bg-orange-500 text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.type === 'ai' && index === messages.length - 1 && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Skip Step Button */}
          <div className="flex justify-end">
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

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask Travion..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-12 rounded-full"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm">
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            Travion is in beta and can make mistakes. Please check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;