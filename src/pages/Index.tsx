import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user?.email_confirmed_at) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-pink-200/30" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-rose-500 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Dating Ideen
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Deine romantischen Momente planen 💕
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Erstelle, organisiere und verwalte deine perfekten Dating-Ideen. 
              Von romantischen Picknicks bis zu aufregenden Abenteuern - 
              plane unvergessliche Momente zu zweit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Jetzt starten
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth')}
              className="border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              <Heart className="h-5 w-5 mr-2" />
              Kostenlos anmelden
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-rose-200">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Ideen sammeln</h3>
              <p className="text-muted-foreground text-sm">
                Sammle und organisiere all deine romantischen Ideen an einem Ort
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-rose-200">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Termine planen</h3>
              <p className="text-muted-foreground text-sm">
                Plane Datum und Zeit für deine perfekten Dates
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-rose-200">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Unvergesslich machen</h3>
              <p className="text-muted-foreground text-sm">
                Teile Links und Details für perfekt geplante romantische Momente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bereit für unvergessliche Momente? ✨
          </h2>
          <p className="text-rose-100 mb-8 max-w-2xl mx-auto">
            Melde dich kostenlos an und beginne noch heute mit der Planung 
            deiner perfekten Dating-Erlebnisse.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-white text-rose-600 hover:bg-rose-50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Heart className="h-5 w-5 mr-2" />
            Kostenlos registrieren
          </Button>
        </div>
      </section>
    </div>
  );
}