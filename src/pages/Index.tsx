import HeroSection from "@/components/HeroSection";
import PopularTrips from "@/components/PopularTrips";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main>
        <HeroSection />
        <PopularTrips />
      </main>
    </div>
  );
};

export default Index;
