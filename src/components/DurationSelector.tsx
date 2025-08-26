import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface DurationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DurationSelector({ value, onChange, className }: DurationSelectorProps) {
  const [isCustom, setIsCustom] = useState(() => {
    // Check if current value is not one of the predefined options
    const predefinedOptions = ['1 hour', '2-3 hours', 'full day', 'weekend'];
    return !predefinedOptions.includes(value) || value === '';
  });
  
  const [customHours, setCustomHours] = useState(() => {
    // Extract number from custom values like "4 Stunden" or "5 hours"
    const match = value.match(/(\d+)\s*(Stunden?|hours?)/i);
    return match ? match[1] : '';
  });

  const predefinedOptions = [
    { value: '1 hour', label: '1 Stunde' },
    { value: '2-3 hours', label: '2-3 Stunden' },
    { value: 'full day', label: 'Ganzer Tag' },
    { value: 'weekend', label: 'Wochenende' }
  ];

  const handleCustomHoursChange = (hours: string) => {
    setCustomHours(hours);
    if (hours && parseInt(hours) > 0) {
      const hourValue = parseInt(hours);
      const label = hourValue === 1 ? 'Stunde' : 'Stunden';
      onChange(`${hourValue} ${label}`);
    } else {
      onChange('');
    }
  };

  const handlePredefinedChange = (selectedValue: string) => {
    onChange(selectedValue);
    setIsCustom(false);
  };

  const switchToCustom = () => {
    setIsCustom(true);
    setCustomHours('2');
    onChange('2 Stunden');
  };

  const switchToPredefined = () => {
    setIsCustom(false);
    onChange('2-3 hours');
    setCustomHours('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">Dauer</label>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={isCustom ? "default" : "outline"}
            size="sm"
            onClick={switchToCustom}
            className="flex-1"
          >
            <Clock className="h-3 w-3 mr-1" />
            Eigene Eingabe
          </Button>
          <Button
            type="button"
            variant={!isCustom ? "default" : "outline"}
            size="sm"
            onClick={switchToPredefined}
            className="flex-1"
          >
            Vordefiniert
          </Button>
        </div>

        {isCustom ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="24"
              value={customHours}
              onChange={(e) => handleCustomHoursChange(e.target.value)}
              placeholder="Anzahl"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">Stunden</span>
          </div>
        ) : (
          <Select value={value} onValueChange={handlePredefinedChange}>
            <SelectTrigger>
              <SelectValue placeholder="Dauer wählen" />
            </SelectTrigger>
            <SelectContent>
              {predefinedOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}