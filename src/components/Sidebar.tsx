import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowLeft, Home, MessageCircle, Heart, MapPin, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: Heart, label: "Wishlist", path: "/preferences" },
    { icon: MapPin, label: "Explore", path: "/destinations" },
  ];

  return (
    <>
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 z-50 hover:scale-110 transition-all duration-300 hover:bg-primary/10 ${
          isCollapsed ? 'left-4' : 'left-60'
        }`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-background/95 backdrop-blur-md border-r border-border z-40 transition-all duration-500 ease-in-out shadow-2xl w-64 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        
        {/* Header with Brand */}
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-4 group">
            <ArrowLeft 
              className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-all duration-200 group-hover:scale-110" 
              onClick={() => setIsCollapsed(true)}
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                <span className="text-lg">✈️</span>
              </div>
              <span className="text-lg font-bold text-foreground">Travion</span>
            </div>
          </div>
          
          {/* My Trips Section - Only show if logged in */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all duration-200 cursor-pointer group hover:scale-105">
              <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium text-foreground">My trips</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          <div className="space-y-2 px-4">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 group"
                onClick={() => {
                  navigate(item.path);
                  setIsCollapsed(true); // Close sidebar on mobile after navigation
                }}
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 mt-auto bg-gradient-to-r from-transparent to-primary/5">
          {currentUser ? (
            <UserProfile />
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  navigate("/signin");
                  setIsCollapsed(true);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-center text-sm text-muted-foreground"
                onClick={() => {
                  navigate("/signup");
                  setIsCollapsed(true);
                }}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 backdrop-blur-sm"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Main Content Spacer for Desktop */}
      <div className={`hidden lg:block transition-all duration-500 ${
        isCollapsed ? 'w-0' : 'w-64'
      }`} />
    </>
  );
};

export default Sidebar;