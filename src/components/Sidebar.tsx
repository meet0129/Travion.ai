import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, User, ChevronLeft, LogOut, ChevronRight, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import { useNavigate } from "react-router-dom";
import MyTrips from "@/components/MyTrips";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMyTripsOpen, setIsMyTripsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleMyTripsClick = () => {
    setIsMyTripsOpen(!isMyTripsOpen);
  };

  const handleBrandClick = () => {
    if (!isCollapsed) {
      navigate("/");
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Single Sidebar Container with Smooth Transitions */}
      <div 
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full bg-background/95 backdrop-blur-md border-r border-border z-40 shadow-lg flex flex-col transition-all duration-500 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64 shadow-2xl'
        }`}
      >
        {/* Collapsed State Content */}
        <div className={`${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 ${isCollapsed ? 'delay-200' : 'delay-0'} absolute inset-0 flex flex-col`}>
          {/* Brand Icon */}
          <div className="p-3 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-primary/10 rounded-xl"
              onClick={() => setIsCollapsed(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                <span className="text-lg">✈️</span>
              </div>
            </Button>
          </div>

          {/* My Trips Icon - Only show if logged in */}
          {currentUser && (
            <div className="py-4">
              <div className="px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 group"
                  title="My trips"
                  onClick={handleMyTripsClick}
                >
                  <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </Button>
              </div>
            </div>
          )}

          {/* Footer - User Avatar or Sign In */}
          <div className="p-2 border-t border-border/50 mt-auto">
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
                onClick={() => setIsCollapsed(false)}
              >
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Button>
            )}
            <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 hover:bg-primary/10 rounded-full"
                onClick={() => setIsCollapsed(false)}
              >
                <Info className="w-6 h-6 text-primary" />
              </Button>
          </div>
        </div>

        {/* Expanded State Content */}
        <div className={`${!isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 ${!isCollapsed ? 'delay-200' : 'delay-0'} absolute inset-0 flex flex-col`}>
          {/* Header with Brand */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors group"
                onClick={handleBrandClick}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-lg">✈️</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">
                    Travion<span className="font-normal">.ai</span>
                  </span>
                </div>
              </div>
            </div>

            {/* My Trips Section - Only show if logged in */}
            {currentUser && (
              <div 
                className="flex items-center gap-3 mb-4 p-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer group"
                onClick={handleMyTripsClick}
              >
                <Briefcase className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" />
                <span>My trips</span>
              </div>
            )}

            {/* New Trip Button - Only show if logged in */}
            {currentUser && (
              <Button
                className="w-full text-center py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-200"
                onClick={() => {
                  navigate("/chat");
                  setIsCollapsed(true);
                }}
              >
                New Trip
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 mt-auto">
            {currentUser ? (
              /* User Profile with Improved Hover Logout */
              <div className="relative">
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 cursor-pointer group"
                  onClick={() => {
                    navigate("/profile");
                    setIsCollapsed(true);
                  }}
                >
                  <img
                    src={currentUser?.photoURL || "/default-avatar.png"}
                    alt="User profile picture"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {currentUser?.displayName || "John Doe"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser?.email || "john.doe@example.com"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
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

            {/* Footer Links */}
            <div className="text-xs text-muted-foreground mt-4">
              <a className="hover:underline cursor-pointer" onClick={() => navigate("/About")}>About</a> ·{" "}
              <a className="hover:underline cursor-pointer" onClick={() => navigate("/Contact")}>Contact</a> ·{" "}
              <a className="hover:underline cursor-pointer" onClick={() => navigate("/Team")}>Team</a> ·{" "}
              <a className="hover:underline cursor-pointer" onClick={() => navigate("/Terms")}>Terms</a> ·{" "}
              <a className="hover:underline cursor-pointer" onClick={() => navigate("/Privacy")}>Privacy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-all duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* My Trips Component */}
      <MyTrips 
        isOpen={isMyTripsOpen} 
        onClose={() => setIsMyTripsOpen(false)} 
      />
    </>
  );
};

export default Sidebar;