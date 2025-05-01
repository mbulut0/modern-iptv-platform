'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true
}: CategorySelectorProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if scroll arrows should be shown
  const checkScrollArrows = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };
  
  // Handle scroll events
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    // Initial check
    checkScrollArrows();
    
    // Add scroll event listener
    scrollContainer.addEventListener('scroll', checkScrollArrows);
    
    // Add resize event listener
    window.addEventListener('resize', checkScrollArrows);
    
    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollArrows);
      window.removeEventListener('resize', checkScrollArrows);
    };
  }, []);
  
  // Scroll left/right
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    
    scrollContainerRef.current.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
  };
  
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    
    scrollContainerRef.current.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="relative">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {/* Categories scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-2 -mx-2 snap-x"
      >
        {/* "All" category option */}
        {showAllOption && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="snap-start"
          >
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => onSelectCategory(null)}
            >
              All
            </Button>
          </motion.div>
        )}
        
        {/* Category buttons */}
        {categories.map((category) => (
          <motion.div
            key={category.category_id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="snap-start"
          >
            <Button
              variant={selectedCategoryId === category.category_id ? "default" : "outline"}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => onSelectCategory(category.category_id)}
            >
              {category.category_name}
            </Button>
          </motion.div>
        ))}
      </div>
      
      {/* Right scroll arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}