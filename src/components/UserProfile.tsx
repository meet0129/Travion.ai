import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Signed out successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer group hover:scale-105">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate">
          {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {currentUser.email}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserProfile;