import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface DatingIdea {
  id: string;
  title: string;
  description: string;
  location: string;
  url?: string;
  date_planned?: string;
  time_planned?: string;
  created_at: string;
}

interface DatingIdeaCardProps {
  idea: DatingIdea;
  onDelete?: (id: string) => void;
}

export function DatingIdeaCard({ idea, onDelete }: DatingIdeaCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="overflow-hidden bg-gradient-card shadow-card hover:shadow-romantic transition-all duration-300 hover:scale-[1.02] border-0">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {idea.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {idea.description}
          </p>
        </div>

        <div className="flex items-center gap-1 text-primary">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{idea.location}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {idea.date_planned && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(idea.date_planned)}
            </Badge>
          )}
          {idea.time_planned && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {idea.time_planned}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {idea.url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(idea.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Link öffnen
            </Button>
          )}
          
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Idee löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Möchtest du diese Dating-Idee wirklich löschen? 
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(idea.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}