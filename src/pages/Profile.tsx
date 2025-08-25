import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface UserProfile {
  id?: string;
  user_id?: string;
  email?: string;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  interests?: string[];
  gender_search?: 'male' | 'female' | 'both';
  relationship_status?: 'single' | 'in_partnership';
  partner_user_id?: string;
  distance_radius?: number;
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interestsInput, setInterestsInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('datingideen_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setInterestsInput((data as any).interests?.join(', ') || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const geocodeLocation = async (city: string, postalCode: string) => {
    try {
      const query = `${city}, ${postalCode}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
    return null;
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let coordinates = null;
      
      // Geocode location if city and postal code are provided
      if (profile.city && profile.postal_code) {
        coordinates = await geocodeLocation(profile.city, profile.postal_code);
      }

      const profileData = {
        ...profile,
        interests: interestsInput ? interestsInput.split(',').map(i => i.trim()).filter(Boolean) : [],
        latitude: coordinates?.latitude || profile.latitude,
        longitude: coordinates?.longitude || profile.longitude,
        user_id: user.id,
        email: user.email || profile.email || ''
      };

      const { error } = await supabase
        .from('datingideen_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      toast({
        title: "Profil gespeichert",
        description: "Dein Profil wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Mein Profil</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profilinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Dein Name"
                />
              </div>

              <div>
                <Label htmlFor="gender">Geschlecht</Label>
                <Select
                  value={profile.gender || ''}
                  onValueChange={(value) => setProfile({ ...profile, gender: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Geschlecht auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Mann</SelectItem>
                    <SelectItem value="female">Frau</SelectItem>
                    <SelectItem value="other">Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="birth_date">
                  Geburtsdatum
                  {profile.birth_date && (
                    <span className="text-muted-foreground ml-2">
                      (Alter: {calculateAge(profile.birth_date)} Jahre)
                    </span>
                  )}
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={profile.birth_date || ''}
                  onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Wohnort</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={profile.city || ''}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="Stadt"
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postleitzahl</Label>
                  <Input
                    id="postal_code"
                    value={profile.postal_code || ''}
                    onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                    placeholder="PLZ"
                  />
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Kurzbeschreibung</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Erzähle etwas über dich..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="interests">Interessen (durch Komma getrennt)</Label>
                <Input
                  id="interests"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="z.B. Reisen, Kochen, Sport, Musik"
                />
              </div>

              <div>
                <Label htmlFor="profile_photo_url">Profilbild URL</Label>
                <Input
                  id="profile_photo_url"
                  value={profile.profile_photo_url || ''}
                  onChange={(e) => setProfile({ ...profile, profile_photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Search Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sucheinstellungen</h3>
              
              <div>
                <Label htmlFor="gender_search">Geschlecht-Suche</Label>
                <Select
                  value={profile.gender_search || 'both'}
                  onValueChange={(value) => setProfile({ ...profile, gender_search: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Suchpräferenz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Mann</SelectItem>
                    <SelectItem value="female">Frau</SelectItem>
                    <SelectItem value="both">Mann und Frau</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="distance_radius">Entfernungsradius (km)</Label>
                <Input
                  id="distance_radius"
                  type="number"
                  value={profile.distance_radius || 50}
                  onChange={(e) => setProfile({ ...profile, distance_radius: parseInt(e.target.value) || 50 })}
                  min="1"
                  max="500"
                />
              </div>
            </div>

            {/* Relationship Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Beziehungsstatus</h3>
              
              <div>
                <Label htmlFor="relationship_status">Status</Label>
                <Select
                  value={profile.relationship_status || 'single'}
                  onValueChange={(value) => setProfile({ ...profile, relationship_status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Beziehungsstatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="in_partnership">In einer Partnerschaft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile.relationship_status === 'in_partnership' && (
                <div>
                  <Label htmlFor="partner_url">Partner Profil-URL</Label>
                  <Input
                    id="partner_url"
                    value={profile.partner_user_id || ''}
                    onChange={(e) => setProfile({ ...profile, partner_user_id: e.target.value })}
                    placeholder="Partner Profil-URL einfügen"
                  />
                  {!profile.partner_user_id && (
                    <p className="text-sm text-muted-foreground mt-1">noch nicht verbunden</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}