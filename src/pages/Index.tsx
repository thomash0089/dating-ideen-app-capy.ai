import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Sparkles } from "lucide-react";
import { DatingIdeaCard, DatingIdea } from "@/components/DatingIdeaCard";
import { AddIdeaForm } from "@/components/AddIdeaForm";
import { useToast } from "@/hooks/use-toast";

// Sample data
const sampleIdeas: DatingIdea[] = [
  {
    id: '1',
    title: 'Romantisches Picknick im Englischen Garten',
    description: 'Ein entspanntes Picknick mit selbstgemachten Leckereien unter den Bäumen. Perfect für warme Sommertage! 🌳☀️',
    location: 'Englischer Garten, München',
    date: '2024-06-15',
    time: '14:00'
  },
  {
    id: '2',
    title: 'Sonnenuntergang am Starnberger See',
    description: 'Den Tag mit einem wunderschönen Sonnenuntergang am See ausklingen lassen. Romantik pur! 🌅💕',
    location: 'Starnberger See, Bayern',
    url: 'https://www.starnbergersee.de'
  },
  {
    id: '3',
    title: 'Kochkurs für Paare',
    description: 'Gemeinsam ein italienisches 3-Gänge-Menü zubereiten und dabei Spaß haben. Anschließend genießen! 👨‍🍳👩‍🍳',
    location: 'Kochschule Milano, Berlin',
    date: '2024-07-20',
    time: '18:30',
    url: 'https://kochschule-milano.de'
  }
];

const Index = () => {
  const [ideas, setIdeas] = useState<DatingIdea[]>(sampleIdeas);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleAddIdea = (newIdea: Omit<DatingIdea, 'id'>) => {
    const idea: DatingIdea = {
      ...newIdea,
      id: Date.now().toString()
    };
    setIdeas(prev => [idea, ...prev]);
    toast({
      title: "Dating Idee hinzugefügt! 💕",
      description: "Deine neue Idee wurde erfolgreich gespeichert.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-gradient-romantic shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Dating Ideen</h1>
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <p className="text-white/90 text-sm">
              Sammle deine schönsten Ideen für romantische Dates
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Noch keine Ideen</h2>
            <p className="text-muted-foreground mb-6">
              Füge deine erste Dating Idee hinzu!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <DatingIdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={() => setShowAddForm(true)}
          className="h-14 w-14 rounded-full bg-gradient-romantic hover:opacity-90 shadow-romantic transition-all duration-300 hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddIdeaForm
          onAddIdea={handleAddIdea}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default Index;