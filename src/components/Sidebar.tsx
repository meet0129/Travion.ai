import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle, Briefcase, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  const profileItems = [
    { icon: User, label: "My Profile", path: "/profile" },
  ];

  // Handle click outside to collapse sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isCollapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsCollapsed(true);
      }
    };

    // Add event listener when sidebar is expanded
    if (!isCollapsed) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed]);

  return (
    <>
      {/* Collapsed Sidebar - Show icons only */}
      {isCollapsed && (
        <div 
          ref={sidebarRef}
          className="fixed left-0 top-0 h-full bg-background/95 backdrop-blur-md border-r border-border z-40 shadow-lg w-16 flex flex-col"
        >
          {/* Brand Icon */}
          <div className="p-3 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-primary/10 rounded-xl"
              onClick={() => setIsCollapsed(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                <span className="text-lg">✈️</span>
              </div>
            </Button>
          </div>

          {/* Menu Icons */}
          <nav className="py-4">
            <div className="space-y-2 px-2">
              {/* My Trips Icon - Only show if logged in */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 group"
                  title="My trips"
                >
                  <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </Button>
              )}

              {/* Profile Icon - Only show if logged in */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 group"
                  title="My Profile"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </Button>
              )}

              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 group"
                  title={item.label}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </Button>
              ))}
            </div>
          </nav>

          {/* Footer - User Avatar or Sign In */}
          <div className="p-2 border-t border-border/50">
            {currentUser ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 hover:bg-primary/10 rounded-full"
                onClick={() => setIsCollapsed(false)}
              >
                <img
                  src={currentUser?.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                title="Sign In"
                onClick={() => navigate("/signin")}
              >
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Expanded Sidebar */}
      {!isCollapsed && (
        <div 
          ref={sidebarRef}
          className="fixed left-0 top-0 h-full bg-background/95 backdrop-blur-md border-r border-border z-40 transition-all duration-500 ease-in-out shadow-2xl w-64"
        >
          {/* Header with Brand */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center mb-4 group">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:transition-all duration-200 cursor-pointer group hover:scale-105" onClick={() => navigate("/")}>
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-lg">✈️</span>
                </div>
                <span className="text-lg font-bold text-foreground">Travion.ai</span>
              </div>
            </div>

            {/* My Trips Section - Only show if logged in */}
            {currentUser && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all duration-200 cursor-pointer group hover:scale-105">
                <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">My Trips</span>
              </div>
            )}

            {/* Profile Section - Only show if logged in */}
            {currentUser && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all duration-200 cursor-pointer group hover:scale-105"
                onClick={() => {
                  navigate("/profile");
                  setIsCollapsed(true);
                }}
              >
                <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">My Profile</span>
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
                    setIsCollapsed(true); // Close sidebar after navigation
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
      )}

      {/* Overlay - Now works on all screen sizes */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;