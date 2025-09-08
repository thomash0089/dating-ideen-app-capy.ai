import { CommunityDatesSearch } from '@/components/CommunityDatesSearch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users } from 'lucide-react';

export default function CommunityDates() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌍</span>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Konkrete Dates
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Community</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Entdecke konkrete Dates in deiner Nähe 🌟
          </h2>
          <p className="text-muted-foreground">
            Finde spannende Dating-Gelegenheiten von anderen Nutzern oder teile deine eigenen Ideen mit der Community.
          </p>
        </div>

        <CommunityDatesSearch />

        {/* Info Box */}
        <div className="mt-8 p-4 bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg border border-rose-200">
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-rose-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Sicher und respektvoll
              </h3>
              <p className="text-sm text-muted-foreground">
                Alle Community-Dates sind öffentlich sichtbar. Bitte achte auf deine Sicherheit und triff dich nur mit Personen, 
                denen du vertraust. Erste Treffen sollten immer an öffentlichen Orten stattfinden.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}