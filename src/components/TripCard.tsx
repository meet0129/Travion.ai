import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

interface TripCardProps {
  title: string;
  description: string;
  duration: string;
  locations: string;
  image: string;
  country: string;
  countryColor: string;
}

const TripCard = ({ 
  title, 
  description, 
  duration, 
  locations, 
  image, 
  country,
  countryColor 
}: TripCardProps) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer active:scale-95 lg:active:scale-100 touch-manipulation">
      {/* Image Section */}
      <div className="relative h-40 lg:h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Country Badge */}
        <div className="absolute top-2 left-2 lg:top-3 lg:left-3">
          <Badge 
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{ backgroundColor: countryColor, color: 'white' }}
          >
            {country}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 lg:p-4">
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm lg:text-base leading-tight lg:leading-normal">
          {title}
        </h3>
        
        <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Trip Details */}
        <div className="flex items-center justify-between text-xs lg:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>{locations}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;