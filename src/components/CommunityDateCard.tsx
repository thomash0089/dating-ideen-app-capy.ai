import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

export interface CommunityDate {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  date_planned: string | null;
  time_planned: string | null;
  duration: string;
  max_participants: number;
  current_participants: number;
  distance_km: number;
  creator_name: string;
  creator_age: number | null;
  creator_gender: string;
  creator_city: string | null;
}

interface CommunityDateCardProps {
  date: CommunityDate;
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

export function CommunityDateCard({ date }: CommunityDateCardProps) {
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="overflow-hidden bg-gradient-card shadow-card hover:shadow-romantic transition-all duration-300 hover:scale-[1.02] border-0">
      <CardContent className="p-4 space-y-3">
        {/* Header with creator info */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {date.title}
            </h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {CATEGORIES[date.category as keyof typeof CATEGORIES] || date.category}
            </Badge>
          </div>
          
          {/* Creator Avatar - top right */}
          <Link to={`/profile/${date.id}`} className="ml-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AvatarImage src="" alt={date.creator_name} />
              <AvatarFallback className="bg-gradient-primary text-white text-sm">
                {getInitials(date.creator_name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {date.description}
        </p>

        <div className="flex items-center gap-1 text-primary">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{date.location}</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({Math.round(date.distance_km)}km)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {date.date_planned && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(date.date_planned)}
            </Badge>
          )}
          {date.time_planned && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {date.time_planned}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {date.current_participants}/{date.max_participants}
          </Badge>
        </div>

        {/* Creator info at bottom */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-medium">{date.creator_name}</span>
            {date.creator_age && <span>• {date.creator_age} Jahre</span>}
            {date.creator_city && <span>• {date.creator_city}</span>}
          </div>
          <span className="capitalize">{date.duration}</span>
        </div>
      </CardContent>
    </Card>
  );
}