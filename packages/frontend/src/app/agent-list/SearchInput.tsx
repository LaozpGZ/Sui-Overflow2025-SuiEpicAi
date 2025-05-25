import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onSearch,
  className,
}) => {
  const [query, setQuery] = useState("");

  // Trigger search
  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  // Search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`flex w-full max-w-md gap-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 w-full"
        />
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button 
        onClick={handleSearch}
        type="submit"
        className="shrink-0"
      >
        Search
      </Button>
    </div>
  );
};

export default SearchInput; 