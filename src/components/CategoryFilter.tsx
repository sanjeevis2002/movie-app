import React from 'react';

interface CategoryFilterProps {
  categories: { name: string; count: number }[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl w-max min-w-full sm:min-w-0">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
          }`}
        >
          All Channels
        </button>

        {categories.map((cat) => {
          const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] ${
                  isSelected ? 'text-zinc-900 font-bold opacity-80' : 'text-zinc-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
