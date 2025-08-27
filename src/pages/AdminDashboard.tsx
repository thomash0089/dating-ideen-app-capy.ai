import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Trash2, Plus, Settings, Upload, Download, LogOut, User } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { DurationSelector } from '@/components/DurationSelector';

interface Inspiration {
  id: string;
  title: string;
  description: string;
  general_location_info?: string;
  location: string;
  url?: string;
  category?: string;
  difficulty_level?: string;
  estimated_cost?: string;
  duration?: string;
  season?: string;
  is_active?: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInspiration, setEditingInspiration] = useState<Inspiration | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    general_location_info: '',
    location: '',
    url: '',
    category: 'general',
    difficulty_level: 'easy',
    estimated_cost: 'low',
    duration: '2 Stunden',
    season: 'all'
  });

  useEffect(() => {
    fetchUserRole();
    fetchInspirations();
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setLoading(false);
    }
  };

  const fetchInspirations = async () => {
    try {
      const { data, error } = await supabase
        .from('datingideen_inspirations' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspirations((data as unknown as Inspiration[]) || []);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Inspirationen konnten nicht geladen werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingInspiration) {
        const { error } = await supabase
          .from('datingideen_inspirations' as any)
          .update(formData)
          .eq('id', editingInspiration.id);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich aktualisiert",
          description: "Die Inspiration wurde erfolgreich bearbeitet.",
        });
      } else {
        const { error } = await supabase
          .from('datingideen_inspirations' as any)
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich hinzugefügt",
          description: "Die neue Inspiration wurde erstellt.",
        });
      }

      resetForm();
      fetchInspirations();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Inspiration konnte nicht gespeichert werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      general_location_info: '',
      location: '',
      url: '',
      category: 'general',
      difficulty_level: 'easy',
      estimated_cost: 'low',
      duration: '2 Stunden',
      season: 'all'
    });
    setShowAddForm(false);
    setEditingInspiration(null);
  };

  const handleEdit = (inspiration: Inspiration) => {
    setFormData({
      title: inspiration.title,
      description: inspiration.description,
      general_location_info: inspiration.general_location_info || '',
      location: inspiration.location,
      url: inspiration.url || '',
      category: inspiration.category || 'general',
      difficulty_level: inspiration.difficulty_level || 'easy',
      estimated_cost: inspiration.estimated_cost || 'low',
      duration: inspiration.duration || '2 Stunden',
      season: inspiration.season || 'all'
    });
    setEditingInspiration(inspiration);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Inspiration löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('datingideen_inspirations' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Die Inspiration wurde erfolgreich entfernt.",
      });
      
      fetchInspirations();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Inspiration konnte nicht gelöscht werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (inspiration: Inspiration) => {
    try {
      const { error } = await supabase
        .from('datingideen_inspirations' as any)
        .update({ is_active: !inspiration.is_active })
        .eq('id', inspiration.id);

      if (error) throw error;

      toast({
        title: "Status geändert",
        description: `Inspiration wurde ${!inspiration.is_active ? 'aktiviert' : 'deaktiviert'}.`,
      });
      
      fetchInspirations();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden: " + error.message,
        variant: "destructive"
      });
    }
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

  const handleJSONImport = async (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      const inspirations = Array.isArray(data) ? data : [data];
      
      const { error } = await supabase
        .from('datingideen_inspirations' as any)
        .insert(inspirations);

      if (error) throw error;

      toast({
        title: "JSON Import erfolgreich",
        description: `${inspirations.length} Inspiration(en) wurden importiert.`,
      });
      
      fetchInspirations();
    } catch (error: any) {
      toast({
        title: "JSON Import Fehler",
        description: "Ungültiges JSON Format: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-rose-100 text-rose-800">
              <Settings className="h-3 w-3 mr-1" />
              Admin
            </Badge>
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4 mr-1" />
                Dashboard
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
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="inspirations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inspirations">Inspirationen verwalten</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inspirations" className="mt-6">
            <div className="space-y-6">
              {/* Add/Edit Form */}
              {showAddForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingInspiration ? 'Inspiration bearbeiten' : 'Neue Inspiration hinzufügen'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Titel *</label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Ort *</label>
                          <Input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Beschreibung *</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Wo? Allgemeine Info</label>
                        <Input
                          value={formData.general_location_info}
                          onChange={(e) => setFormData({ ...formData, general_location_info: e.target.value })}
                          placeholder="Park, Café, Bar"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">URL (optional)</label>
                        <Input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Kategorie</label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">Allgemein</SelectItem>
                              <SelectItem value="romantic">Romantisch</SelectItem>
                              <SelectItem value="adventure">Abenteuer</SelectItem>
                              <SelectItem value="indoor">Indoor</SelectItem>
                              <SelectItem value="outdoor">Outdoor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Schwierigkeit</label>
                          <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Einfach</SelectItem>
                              <SelectItem value="medium">Mittel</SelectItem>
                              <SelectItem value="hard">Schwer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Kosten</label>
                          <Select value={formData.estimated_cost} onValueChange={(value) => setFormData({ ...formData, estimated_cost: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Niedrig</SelectItem>
                              <SelectItem value="medium">Mittel</SelectItem>
                              <SelectItem value="high">Hoch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <DurationSelector
                          value={formData.duration}
                          onChange={(value) => setFormData({ ...formData, duration: value })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Saison</label>
                          <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Ganzjährig</SelectItem>
                              <SelectItem value="spring">Frühling</SelectItem>
                              <SelectItem value="summer">Sommer</SelectItem>
                              <SelectItem value="autumn">Herbst</SelectItem>
                              <SelectItem value="winter">Winter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-600">
                          {editingInspiration ? 'Aktualisieren' : 'Hinzufügen'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Abbrechen
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-rose-500 to-pink-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Inspiration
                </Button>
              </div>

              {/* Inspirations List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspirations.map((inspiration) => (
                  <Card key={inspiration.id} className={`${!inspiration.is_active ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                            {inspiration.title}
                          </h3>
                          <Badge 
                            variant={inspiration.is_active ? "default" : "secondary"}
                            className="text-xs cursor-pointer"
                            onClick={() => toggleActive(inspiration)}
                          >
                            {inspiration.is_active ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs line-clamp-2">
                          {inspiration.description}
                        </p>
                        <p className="text-primary text-xs">{inspiration.location}</p>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(inspiration)}
                            className="text-xs"
                          >
                            Bearbeiten
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(inspiration.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>JSON Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="JSON Daten hier einfügen..."
                      rows={10}
                      id="json-import"
                    />
                    <Button
                      onClick={() => {
                        const textarea = document.getElementById('json-import') as HTMLTextAreaElement;
                        if (textarea.value) {
                          handleJSONImport(textarea.value);
                          textarea.value = '';
                        }
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      JSON importieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      const dataStr = JSON.stringify(inspirations, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'inspirations.json';
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON exportieren
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Einstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Weitere Einstellungen folgen in kommenden Updates...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}