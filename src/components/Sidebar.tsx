import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Info, MessageSquare, Users, FileText, Shield, Luggage, ArrowLeft } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isLoggedIn = false; // TODO: Connect to Supabase for authentication

  const menuItems = [
    { icon: Info, label: "About", active: false },
    { icon: FileText, label: "Contact", active: false },
    { icon: Users, label: "Team", active: false },
    { icon: FileText, label: "Terms", active: false },
    { icon: Shield, label: "Privacy", active: false },
  ];

  return (
    <>
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden hover:scale-110 transition-all duration-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-background border-r border-border z-40 transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      } w-64 shadow-lg`}>
        
        {/* Header with Brand */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-lg">✈️</span>
              </div>
              <span className="text-lg font-bold text-foreground">Travion</span>
            </div>
          </div>
          
          {/* My Trips Section - Only show if logged in */}
          {isLoggedIn && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <Luggage className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">My trips</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start gap-3 hover:scale-105 transition-all duration-200 ${
                    item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Collapse</span>
          </Button>
          
          {/* Profile Section */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="font-medium text-foreground text-sm">My profile</span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;