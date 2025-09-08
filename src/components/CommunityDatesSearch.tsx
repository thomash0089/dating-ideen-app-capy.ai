import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Search, Users, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CommunityDateCard, CommunityDate } from "@/components/CommunityDateCard";
import { useToast } from "@/hooks/use-toast";

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
  country_code?: string;
}


const CATEGORIES = {
  romantic: '💕 Romantisch',
  adventure: '🏔️ Abenteuer',
  cultural: '🎭 Kultur',
  outdoor: '🌳 Outdoor',
  indoor: '🏠 Indoor',
  food_drinks: '🍽️ Essen & Trinken',
  sports: '⚽ Sport',
  creative: '🎨 Kreativ',
  relaxation: '🧘 Entspannung',
  entertainment: '🎪 Entertainment'
};

export function CommunityDatesSearch() {
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [radius, setRadius] = useState(50);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('all');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [gender, setGender] = useState('all');
  const [communityDates, setCommunityDates] = useState<CommunityDate[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const searchLocationGeocoding = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('geocode', {
        body: { query }
      });

      if (error) {
        console.error('Geocoding error:', error);
        return;
      }

      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchLocation.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocationGeocoding(searchLocation);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchLocation]);

  const handleLocationSelect = (location: GeocodeResult) => {
    setSelectedLocation(location);
    setSearchLocation(location.display_name);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!selectedLocation) {
      toast({
        title: "Standort erforderlich",
        description: "Bitte wähle einen Standort für die Suche aus.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_dates_by_radius', {
        center_lat: selectedLocation.lat,
        center_lng: selectedLocation.lon,
        radius_km: radius,
        start_date: startDate || null,
        end_date: endDate || null,
        idea_category: category === 'all' ? null : (category as any),
        min_age: minAge ? parseInt(minAge) : null,
        max_age: maxAge ? parseInt(maxAge) : null,
        gender_filter: gender === 'all' ? null : (gender as any)
      });

      if (error) throw error;

      setCommunityDates(data || []);
      
      toast({
        title: "Suche abgeschlossen",
        description: `${data?.length || 0} Date(s) gefunden.`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Fehler bei der Suche",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Suchfilter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location Search */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location-search">Standort</Label>
              <div className="relative">
                <Input
                  id="location-search"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Stadt oder Adresse eingeben..."
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => handleLocationSelect(result)}
                      >
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <Label htmlFor="radius">Umkreis (km)</Label>
              <Select value={radius.toString()} onValueChange={(value) => setRadius(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                  <SelectItem value="200">200 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Von Datum</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Bis Datum</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Kategorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <Label htmlFor="min-age">Min. Alter</Label>
              <Input
                id="min-age"
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="18"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-age">Max. Alter</Label>
              <Input
                id="max-age"
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="99"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Geschlecht</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Alle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="female">Weiblich</SelectItem>
                <SelectItem value="diverse">Divers</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="w-full md:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Suche läuft...' : 'Dates suchen'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {communityDates.length > 0 && (
          <h3 className="text-lg font-semibold">
            {communityDates.length} Date(s) gefunden
          </h3>
        )}

        {communityDates.map((date) => (
          <CommunityDateCard key={date.id} date={date} />
        ))}

        {!loading && communityDates.length === 0 && selectedLocation && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Keine Dates gefunden
            </h3>
            <p className="text-muted-foreground">
              Probiere andere Suchfilter oder erweitere den Suchradius.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}