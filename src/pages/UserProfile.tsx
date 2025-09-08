import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id?: string;
  user_id?: string;
  email?: string;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  city?: string;
  postal_code?: string;
  bio?: string;
  interests?: string[];
  profile_photo_url?: string;
  created_at?: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('datingideen_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Fehler",
          description: "Profil konnte nicht geladen werden.",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'male': return 'Mann';
      case 'female': return 'Frau';
      case 'other': return 'Divers';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/community-dates">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Profil nicht gefunden</h1>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.user_id;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/community-dates">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              {isOwnProfile ? 'Mein Profil' : 'Profil'}
            </h1>
          </div>
          {isOwnProfile && (
            <Link to="/profile">
              <Button variant="outline">
                Bearbeiten
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile.profile_photo_url || ""} alt={profile.name || "Profil"} />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {profile.name ? getInitials(profile.name) : <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <CardTitle className="text-2xl">
                  {profile.name || 'Anonymer Nutzer'}
                </CardTitle>
                <div className="flex items-center justify-center gap-4 text-muted-foreground mt-2">
                  {profile.birth_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{calculateAge(profile.birth_date)} Jahre</span>
                    </div>
                  )}
                  {profile.gender && (
                    <span>{getGenderLabel(profile.gender)}</span>
                  )}
                  {profile.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {profile.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Über mich</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Interessen</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!isOwnProfile && (
              <div className="flex gap-4 pt-4">
                <Button className="flex-1 bg-gradient-romantic hover:opacity-90">
                  <Heart className="h-4 w-4 mr-2" />
                  Interessiert
                </Button>
                <Button variant="outline" className="flex-1">
                  Nachricht senden
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}