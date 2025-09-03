import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Heart, Sparkles } from "lucide-react";
import { DurationSelector } from "@/components/DurationSelector";
import { supabase } from "@/integrations/supabase/client";

interface DatingIdea {
  title: string;
  description: string;
  general_location_info?: string;
  location: string;
  url?: string;
  duration?: string;
  date_planned?: string | null;
  time_planned?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
  country_code?: string;
}

interface AddIdeaFormProps {
  onSubmit: (idea: Omit<DatingIdea, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  editingIdea?: DatingIdea & { id: string; created_at: string; general_location_info?: string; duration?: string };
  isEditing?: boolean;
}

export function AddIdeaForm({ onSubmit, onCancel, editingIdea, isEditing = false }: AddIdeaFormProps) {
  const [formData, setFormData] = useState({
    title: editingIdea?.title || '',
    description: editingIdea?.description || '',
    general_location_info: editingIdea?.general_location_info || '',
    location: editingIdea?.location || '',
    url: editingIdea?.url || '',
    duration: editingIdea?.duration || '2 Stunden',
    date_planned: editingIdea?.date_planned || '',
    time_planned: editingIdea?.time_planned || '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Beschreibung ist erforderlich';
    }
    // Location is now optional with ** marking
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode', {
        body: { query }
      });

      if (error) {
        console.error('Geocoding error:', error);
        setSearchResults([]);
        return;
      }

      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result: GeocodeResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.display_name,
      latitude: result.lat,
      longitude: result.lon
    }));
    setSearchResults([]);
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (formData.location.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(formData.location);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [formData.location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Leere Strings in NULL konvertieren, damit Postgres keinen Fehler wirft
        const cleanedData = {
          ...formData,
          url: formData.url.trim() || null,
          general_location_info: formData.general_location_info.trim() || null,
          date_planned: formData.date_planned || null,
          time_planned: formData.time_planned || null,
        };

        await onSubmit(cleanedData);

        setFormData({
          title: '',
          description: '',
          general_location_info: '',
          location: '',
          url: '',
          duration: '2 Stunden',
          date_planned: '',
          time_planned: '',
          latitude: null,
          longitude: null,
        });
      } catch (error) {
        // Error handling is done in the parent component
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-romantic border-0 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-romantic bg-clip-text text-transparent">
            <Heart className="inline h-5 w-5 mr-2 text-primary" />
            {isEditing ? 'Dating Idee bearbeiten' : 'Neue Dating Idee'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titel *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="z.B. Romantisches Picknick im Park"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Beschreibung *
                <Sparkles className="inline h-3 w-3 ml-1 text-primary" />
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Beschreibe deine Dating Idee... 😍✨"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="general_location_info" className="text-sm font-medium">
                Wo? Allgemeine Info
              </Label>
              <Input
                id="general_location_info"
                value={formData.general_location_info}
                onChange={(e) => handleChange('general_location_info', e.target.value)}
                placeholder="Park, Café, Bar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Ort/Stadt/Adresse **
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="z.B. Englischer Garten, München"
                  className={errors.location ? 'border-destructive' : ''}
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
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">
                URL (optional)
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <DurationSelector
              value={formData.duration}
              onChange={(value) => handleChange('duration', value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Datum (optional)
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date_planned}
                  onChange={(e) => handleChange('date_planned', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Uhrzeit (optional)
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time_planned}
                  onChange={(e) => handleChange('time_planned', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-romantic hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                <Heart className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Speichern...' : (isEditing ? 'Änderungen speichern' : 'Speichern')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
