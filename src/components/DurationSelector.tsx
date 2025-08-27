import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface DurationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DurationSelector({ value, onChange, className }: DurationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    // Extract numeric value from current value for display
    const match = value.match(/(\d+)/);
    return match ? match[1] : '2';
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const predefinedOptions = [
    '2-3 Stunden',
    '3-5 Stunden', 
    'Ganzer Tag',
    'Wochenende'
  ];

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = e.target.value;
    setInputValue(hours);
    
    if (hours && parseInt(hours) > 0) {
      const hourValue = parseInt(hours);
      const label = hourValue === 1 ? 'Stunde' : 'Stunden';
      onChange(`${hourValue} ${label}`);
    } else {
      onChange('2 Stunden'); // Default fallback
    }
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    
    // Update input value based on selected option
    const match = option.match(/(\d+)/);
    if (match) {
      setInputValue(match[1]);
    } else {
      // For non-numeric options, keep current input or default to 2
      setInputValue(inputValue || '2');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">Dauer</label>
      
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center">
          <Input
            ref={inputRef}
            type="number"
            min="1"
            max="24"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="2"
            className="pr-20"
          />
          <div className="absolute right-0 flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Std.</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleDropdown}
              className="h-8 px-2"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50">
            <div className="py-1">
              {predefinedOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}