import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ExternalLink, Heart } from "lucide-react";

export interface Inspiration {
  id: string;
  title: string;
  description: string;
  location: string;
  url?: string;
  category?: string;
  difficulty_level?: string;
  estimated_cost?: string;
  duration?: string;
  season?: string;
}

interface InspirationCardProps {
  inspiration: Inspiration;
  onAddToMyIdeas?: (inspiration: Inspiration) => void;
}

export function InspirationCard({ inspiration, onAddToMyIdeas }: InspirationCardProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'romantic': return 'bg-rose-100 text-rose-800';
      case 'adventure': return 'bg-blue-100 text-blue-800';
      case 'indoor': return 'bg-green-100 text-green-800';
      case 'outdoor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (level?: string) => {
    switch (level) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getCostIcon = (cost?: string) => {
    switch (cost) {
      case 'low': return '💰';
      case 'medium': return '💰💰';
      case 'high': return '💰💰💰';
      default: return '💰';
    }
  };

  return (
    <Card className="overflow-hidden bg-gradient-card shadow-card hover:shadow-romantic transition-all duration-300 hover:scale-[1.02] border-0">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
              {inspiration.title}
            </h3>
            {inspiration.category && (
              <Badge className={`text-xs ${getCategoryColor(inspiration.category)}`}>
                {inspiration.category}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {inspiration.description}
          </p>
        </div>

        <div className="flex items-center gap-1 text-primary">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{inspiration.location}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {inspiration.duration && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {inspiration.duration}
            </Badge>
          )}
          {inspiration.difficulty_level && (
            <Badge variant="secondary" className="text-xs">
              {getDifficultyIcon(inspiration.difficulty_level)} {inspiration.difficulty_level}
            </Badge>
          )}
          {inspiration.estimated_cost && (
            <Badge variant="secondary" className="text-xs">
              {getCostIcon(inspiration.estimated_cost)} {inspiration.estimated_cost}
            </Badge>
          )}
          {inspiration.season && inspiration.season !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {inspiration.season}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {inspiration.url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(inspiration.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Link öffnen
            </Button>
          )}
          
          {onAddToMyIdeas && (
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-romantic hover:opacity-90 transition-opacity"
              onClick={() => onAddToMyIdeas(inspiration)}
            >
              <Heart className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}