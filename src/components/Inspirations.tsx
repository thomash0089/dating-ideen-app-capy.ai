import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InspirationCard, type Inspiration } from '@/components/InspirationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Lightbulb } from 'lucide-react';

interface InspirationsProps {
  onAddToMyIdeas: (inspiration: Inspiration) => void;
}

export function Inspirations({ onAddToMyIdeas }: InspirationsProps) {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspirations();
  }, []);

  const fetchInspirations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('datingideen_inspirations' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspirations((data as unknown as Inspiration[]) || []);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Inspirationen konnten nicht geladen werden: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Inspirationen</h3>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border border-rose-200">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (inspirations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
          <Lightbulb className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Keine Inspirationen verfügbar
        </h3>
        <p className="text-muted-foreground">
          Schau später wieder vorbei für neue Ideen!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Inspirationen ({inspirations.length})
        </h3>
        <p className="text-sm text-muted-foreground ml-2">
          Klicke auf "Hinzufügen" um eine Inspiration zu deinen eigenen Ideen zu speichern
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inspirations.map((inspiration) => (
          <InspirationCard
            key={inspiration.id}
            inspiration={inspiration}
            onAddToMyIdeas={onAddToMyIdeas}
          />
        ))}
      </div>
    </div>
  );
}