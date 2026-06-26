import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

// Rotating placeholder accent colors so each dashboard search field shows a
// distinct hue instead of the same muted grey everywhere.
const PLACEHOLDER_ACCENTS = [
  "placeholder:text-medicare-blue/70",
  "placeholder:text-medicare-teal/70",
  "placeholder:text-medicare-amber/70",
  "placeholder:text-medicare-green/70",
  "placeholder:text-medicare-red/70",
  "placeholder:text-primary/70",
];

const ICON_ACCENTS = [
  "text-medicare-blue",
  "text-medicare-teal",
  "text-medicare-amber",
  "text-medicare-green",
  "text-medicare-red",
  "text-primary",
];

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  showFilter = true,
  onFilterClick,
  className = "",
}: SearchBarProps) {
  const idx = hashStr(placeholder) % PLACEHOLDER_ACCENTS.length;
  const placeholderAccent = PLACEHOLDER_ACCENTS[idx];
  const iconAccent = ICON_ACCENTS[idx];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-primary transition-all">
        <Search size={16} className={`${iconAccent} flex-shrink-0`} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-transparent text-sm text-foreground ${placeholderAccent} outline-none w-full`}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {showFilter && (
        <Button
          variant="outline"
          size="sm"
          className="border-border h-[42px] px-4 rounded-xl"
          onClick={onFilterClick}
        >
          <Filter size={14} className="mr-2" />
          Filter
        </Button>
      )}
    </div>
  );
}

