import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-2xl">✈️</span>
          </div>
          <span className="text-2xl lg:text-3xl font-bold text-foreground">Travion</span>
        </div>

        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="text-6xl lg:text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-base lg:text-lg text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs lg:text-sm text-muted-foreground mt-8">
          Need help? Contact our support team or start planning your dream trip.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
