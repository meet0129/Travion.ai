import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Info, MessageSquare, Users, FileText, Shield, Briefcase, ArrowLeft } from "lucide-react";
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
          {isLoggedIn && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all duration-200 cursor-pointer group hover:scale-105">
              <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium text-foreground">My trips</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start gap-3 hover:scale-105 transition-all duration-200 hover:bg-primary/10 group ${
                    item.active ? 'bg-primary/10 text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 mt-auto bg-gradient-to-r from-transparent to-primary/5">
          {/* Profile Section */}
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer group hover:scale-105">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <User className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium text-foreground text-sm">My profile</span>
          </div>
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