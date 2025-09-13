import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Info, MessageSquare, Users, FileText, Shield } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems = [
    { icon: MessageSquare, label: "My profile", active: false },
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
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-background border-r border-border z-40 transition-transform lg:translate-x-0 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      } w-64`}>
        
        {/* Profile Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">My profile</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${
                    item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;