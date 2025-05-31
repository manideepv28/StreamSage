import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const allCategories = ['All', ...categories];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {allCategories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'secondary'}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
