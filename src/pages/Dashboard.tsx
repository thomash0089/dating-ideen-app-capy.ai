import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DatingIdeaCard } from '@/components/DatingIdeaCard';
import { AddIdeaForm } from '@/components/AddIdeaForm';
import { Inspirations } from '@/components/Inspirations';
import { type Inspiration } from '@/components/InspirationCard';
import { Plus, LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DatingIdea {
  id: string;
  title: string;
  description: string;
  general_location_info?: string;
  location: string;
  url?: string;
  duration?: string;
  date_planned?: string;
  time_planned?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [ideas, setIdeas] = useState<DatingIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [editingIdea, setEditingIdea] = useState<DatingIdea | null>(null);

  useEffect(() => {
    fetchIdeas();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('datingideen_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchIdeas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('datingideen_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Ideen konnten nicht geladen werden: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdea = async (ideaData: Omit<DatingIdea, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      if (editingIdea) {
        // Update existing idea
        const { data, error } = await supabase
          .from('datingideen_ideas')
          .update(ideaData)
          .eq('id', editingIdea.id)
          .select()
          .single();

        if (error) throw error;

        setIdeas(ideas.map(idea => idea.id === editingIdea.id ? data : idea));
        setEditingIdea(null);
        toast({
          title: "Gespeichert!",
          description: "Deine Dating-Idee wurde aktualisiert.",
        });
      } else {
        // Create new idea
        const { data, error } = await supabase
          .from('datingideen_ideas')
          .insert({
            ...ideaData,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        setIdeas([data, ...ideas]);
        toast({
          title: "Erfolg!",
          description: "Deine Dating-Idee wurde gespeichert.",
        });
      }
      
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Idee konnte nicht gespeichert werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('datingideen_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIdeas(ideas.filter(idea => idea.id !== id));
      toast({
        title: "Gelöscht",
        description: "Dating-Idee wurde entfernt.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Idee konnte nicht gelöscht werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddInspirationToMyIdeas = async (inspiration: Inspiration) => {
    if (!user) return;

    try {
      const ideaData = {
        title: inspiration.title,
        description: inspiration.description,
        location: inspiration.location,
        url: inspiration.url || '',
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('datingideen_ideas')
        .insert(ideaData)
        .select()
        .single();

      if (error) throw error;

      setIdeas([data, ...ideas]);
      toast({
        title: "Hinzugefügt!",
        description: "Die Inspiration wurde zu deinen Dating-Ideen hinzugefügt.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Inspiration konnte nicht hinzugefügt werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditIdea = (idea: DatingIdea) => {
    setEditingIdea(idea);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingIdea(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen: " + error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💕</span>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              Dating Ideen
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userRole === 'admin' ? 'Admin' : 'User'}</span>
            </div>
            {userRole === 'admin' && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4 mr-1" />
                Profil
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Willkommen zurück! 👋
          </h2>
          <p className="text-muted-foreground">
            Hier sind deine romantischen Ideen für unvergessliche Momente zu zweit.
          </p>
        </div>

        {/* Add/Edit Idea Form */}
        {showForm && (
          <div className="mb-6">
            <AddIdeaForm
              onSubmit={handleAddIdea}
              onCancel={handleCancelEdit}
              editingIdea={editingIdea}
              isEditing={!!editingIdea}
            />
          </div>
        )}

        {/* Tabs for Ideas and Inspirations */}
        <Tabs defaultValue="ideas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ideas">Meine Ideen</TabsTrigger>
            <TabsTrigger value="inspirations">Inspirationen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ideas" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg border border-rose-200">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))
              ) : ideas.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                    <span className="text-2xl">💝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Noch keine Dating-Ideen
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Erstelle deine erste romantische Idee oder schau dir die Inspirationen an!
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Erste Idee hinzufügen
                  </Button>
                </div>
              ) : (
                // Ideas list
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Deine Dating-Ideen ({ideas.length})
                    </h3>
                    {!showForm && (
                      <Button
                        onClick={() => setShowForm(true)}
                        size="sm"
                        className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Neue Idee
                      </Button>
                    )}
                  </div>
                  
                  {ideas.map((idea) => (
                    <DatingIdeaCard
                      key={idea.id}
                      idea={idea}
                      onDelete={handleDeleteIdea}
                      onEdit={handleEditIdea}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="inspirations" className="mt-6">
            <Inspirations onAddToMyIdeas={handleAddInspirationToMyIdeas} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button for mobile */}
      {!showForm && !loading && (
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 md:hidden"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}