"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import { Check, ChevronDown, ArrowDownAZ, ArrowUpZA, ListFilter, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

// Types
interface SortOption {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

interface SortAndFilterProps {
  sortOptions: SortOption[];
  filterCategories: FilterCategory[];
  onSortChange?: (value: string) => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  className?: string;
}

// Main component for sort and filter
const SortAndFilter = ({
  sortOptions,
  filterCategories,
  onSortChange,
  onFilterChange,
  className,
}: SortAndFilterProps) => {
  const [selectedSort, setSelectedSort] = React.useState<string>(sortOptions[0]?.value || "");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({});

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Toggle filter option
  const handleFilterToggle = (categoryId: string, optionValue: string) => {
    setActiveFilters((prev) => {
      const currentFilters = prev[categoryId] || [];
      const newFilters = currentFilters.includes(optionValue)
        ? currentFilters.filter((v) => v !== optionValue)
        : [...currentFilters, optionValue];

      const result = {
        ...prev,
        [categoryId]: newFilters,
      };

      if (onFilterChange) {
        onFilterChange(result);
      }

      return result;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Remove a single filter
  const removeFilter = (categoryId: string, optionValue: string) => {
    setActiveFilters((prev) => {
      const newFilters = {
        ...prev,
        [categoryId]: prev[categoryId].filter((v) => v !== optionValue),
      };

      // Remove empty arrays
      if (newFilters[categoryId].length === 0) {
        delete newFilters[categoryId];
      }

      if (onFilterChange) {
        onFilterChange(newFilters);
      }

      return newFilters;
    });
  };

  // Count of active filters
  const activeFilterCount = Object.values(activeFilters).reduce(
    (count, filters) => count + filters.length,
    0
  );

  // Get label for filter option
  const getFilterOptionLabel = (categoryId: string, optionValue: string): string => {
    const category = filterCategories.find((c) => c.id === categoryId);
    if (!category) return optionValue;
    
    const option = category.options.find((o) => o.value === optionValue);
    return option?.label || optionValue;
  };

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger className="h-8 gap-1 w-[180px] bg-background">
            <ArrowDownAZ className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Dropdown */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Active Filters */}
        {Object.entries(activeFilters).map(([categoryId, values]) =>
          values.map((value) => (
            <div
              key={`${categoryId}-${value}`}
              className="flex items-center h-8 px-2 text-sm bg-muted rounded-md gap-1"
            >
              <span className="text-foreground">
                {filterCategories.find((c) => c.id === categoryId)?.name}: {getFilterOptionLabel(categoryId, value)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full"
                onClick={() => removeFilter(categoryId, value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}

        {/* Filter Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 bg-background"
            >
              <ListFilter className="h-4 w-4 text-muted-foreground" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] flex items-center justify-center text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-2" align="start">
            <div className="space-y-2">
              {filterCategories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <h4 className="text-sm font-medium">{category.name}</h4>
                  <div className="space-y-1">
                    {category.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 rounded-md px-2 py-1 text-sm hover:bg-accent cursor-pointer"
                        onClick={() => handleFilterToggle(category.id, option.value)}
                      >
                        <div className="h-4 w-4 border rounded flex items-center justify-center">
                          {activeFilters[category.id]?.includes(option.value) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <span>{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default SortAndFilter; 