import TripCard from "./TripCard";
import tajMahalImage from "@/assets/taj-mahal.jpg";
import keralaImage from "@/assets/kerala-backwaters.jpg";
import rajasthanImage from "@/assets/rajasthan-desert.jpg";
import himalayasImage from "@/assets/himalayas.jpg";

const PopularTrips = () => {
  const trips = [
    {
      title: "Golden Triangle: Delhi, Agra & Jaipur Heritage Journey",
      description: "Explore India's most iconic monuments including the Taj Mahal, Red Fort, and Amber Palace in this classic heritage tour.",
      duration: "7 Days",
      locations: "3 Cities",
      image: tajMahalImage,
      country: "NORTH INDIA",
      countryColor: "#8B5CF6"
    },
    {
      title: "Kerala Backwaters and Spice Gardens: Tropical Paradise",
      description: "Cruise through serene backwaters, visit tea plantations, and experience Kerala's unique culture and cuisine.",
      duration: "6 Days",
      locations: "4 Locations",
      image: keralaImage,
      country: "SOUTH INDIA",
      countryColor: "#10B981"
    },
    {
      title: "Rajasthan Royal Desert: Palaces and Sand Dunes",
      description: "Experience royal palaces, desert safaris, and authentic Rajasthani culture in the land of kings.",
      duration: "8 Days",
      locations: "5 Cities",
      image: rajasthanImage,
      country: "WEST INDIA",
      countryColor: "#F59E0B"
    },
    {
      title: "Himalayan Adventure: Mountains and Monasteries",
      description: "Trek through breathtaking landscapes, visit ancient monasteries, and experience Himalayan serenity.",
      duration: "10 Days",
      locations: "6 Locations",
      image: himalayasImage,
      country: "HIMALAYAS",
      countryColor: "#3B82F6"
    },
  ];

  return (
    <div className="px-4 py-2 lg:py-4 max-w-7xl mx-auto">
      <div className="text-center mb-8 lg:mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 lg:mb-4">Popular Trips</h2>
        <p className="text-muted-foreground text-base lg:text-lg">Discover India's most loved destinations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {trips.map((trip, index) => (
          <TripCard key={index} {...trip} />
        ))}
      </div>
    </div>
  );
};

export default PopularTrips;