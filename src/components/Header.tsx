import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      {/* Left side - Brand */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-foreground">Travion</span>
            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">
              BETA
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          My trips
        </Button>
        
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};

export default Header;