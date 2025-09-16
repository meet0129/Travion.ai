import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit3, 
  Settings, 
  Award, 
  Camera, 
  Heart, 
  Star,
  Plane,
  Map,
  Trophy,
  Lock,
  Globe,
  Mail,
  Phone,
  Camera as CameraIcon,
  MapPin as MapPinIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Plane as PlaneIcon,
  MapIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    location: '',
    favoriteDestination: '',
    bio: '',
    phone: '',
    memberSince: currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Recently'
  });

  // Mock data for achievements and stats
  const stats = {
    trips: 0,
    countries: 0,
    achievements: 0
  };

  const unlockedAchievements = [
    // Currently empty - user hasn't unlocked any yet
  ];

  const lockedAchievements = [
    {
      id: 1,
      title: "First Trip",
      description: "Planned your first trip with AI assistance",
      icon: PlaneIcon,
      locked: true
    },
    {
      id: 2,
      title: "Explorer",
      description: "Visited 5 different countries",
      icon: MapIcon,
      locked: true
    },
    {
      id: 3,
      title: "Photo Collector",
      description: "Uploaded 50 travel photos",
      icon: CameraIcon,
      locked: true
    },
    {
      id: 4,
      title: "Luxury Traveler",
      description: "Booked a 5-star experience",
      icon: StarIcon,
      locked: true
    },
    {
      id: 5,
      title: "Romantic",
      description: "Planned a romantic getaway",
      icon: HeartIcon,
      locked: true
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully!"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar/>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6 border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-26 h-26 border-4 border-primary/20">
                  <AvatarImage src={currentUser.photoURL || ''} alt="Profile" />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {currentUser.displayName || 'Traveler'}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {profileData.memberSince}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gradient-primary hover:opacity-90 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-6">
                  <div className="text-left">
                    <div className="text-3xl font-bold text-primary mb-1">{stats.trips}</div>
                    <div className="text-sm text-muted-foreground">Trips</div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-primary mb-1">{stats.countries}</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-primary mb-1">{stats.achievements}</div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Details Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        {profileData.fullName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-muted-foreground">
                      {profileData.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter your location"
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        {profileData.location || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        {profileData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favoriteDestination">Favorite Destination</Label>
                  {isEditing ? (
                    <Input
                      id="favoriteDestination"
                      value={profileData.favoriteDestination}
                      onChange={(e) => handleInputChange('favoriteDestination', e.target.value)}
                      placeholder="Enter your favorite travel destination"
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      {profileData.favoriteDestination || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg min-h-[100px]">
                      {profileData.bio || 'No bio provided yet.'}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 text-white">
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="space-y-6">
              {/* Unlocked Achievements */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Unlocked Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {unlockedAchievements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No achievements unlocked yet. Start planning your first trip!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unlockedAchievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                          <achievement.icon className="w-8 h-8 text-primary mb-3" />
                          <h3 className="font-semibold mb-2">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Locked Achievements */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    Locked Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAchievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 border border-border rounded-lg bg-muted/20 relative">
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        </div>
                        <achievement.icon className="w-8 h-8 text-muted-foreground mb-3" />
                        <h3 className="font-semibold mb-2 text-muted-foreground">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Travel Preferences
                </CardTitle>
                <p className="text-muted-foreground">
                  Customize your travel preferences to get better AI recommendations.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon...</h3>
                  <p className="text-muted-foreground">
                    We're working on personalized travel preferences to enhance your experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
