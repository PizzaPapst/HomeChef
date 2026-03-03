import React from 'react';
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Clock,
  Heart,
  Timer,
  CaretRight,
  Plus
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge.jsx";

/**
 * RecipeCard Component
 * Variants: large, small, list, outline
 */
const RecipeCard = ({
  recipe,
  variant = 'small',
  isFavorite = false,
  onFavoriteClick,
  onClick,
  className
}) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Robust image fallback logic
  // Priority: 1. Provided URL, 2. Backend binary image endpoint, 3. Curated Unsplash placeholder
  const getRecipeImage = () => {
    if (recipe?.imageUrl && (recipe.imageUrl.startsWith('http') || recipe.imageUrl.startsWith('blob'))) {
      return recipe.imageUrl;
    }

    if (recipe?.id && apiUrl) {
      return `${apiUrl}/recipes/${recipe.id}/image`;
    }

    // High-quality food placeholder
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";
  };

  const image = getRecipeImage();
  const title = recipe?.title || "Rezept Titel";
  const time = recipe?.prepTime || "25";

  // Wrapper for consistency
  const CardWrapper = ({ children, className: wrapperClass }) => {
    if (onClick) {
      return (
        <div
          onClick={onClick}
          className={cn("cursor-pointer active:scale-[0.98] transition-all", wrapperClass)}
        >
          {children}
        </div>
      );
    }
    return (
      <Link
        to={`/recipe/${recipe?.id || 'placeholder'}`}
        className={cn("block", wrapperClass)}
      >
        {children}
      </Link>
    );
  };

  // --- LARGE CARD (Featured) ---
  if (variant === 'large') {
    return (
      <CardWrapper className={cn("relative w-full h-[240px] rounded-[16px] overflow-hidden group shadow-card-shadow", className)}>
        {/* Background Image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content Container */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Top Row: Badges & Actions */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              {recipe?.isNew && (
                <Badge variant="brand">Neu</Badge>
              )}
              {recipe?.categories?.map(cat => (
                <Badge key={cat.id} variant="glass">{cat.name}</Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => { e.preventDefault(); onFavoriteClick?.(); }}
                className="bg-white/90 p-2 rounded-full transition-colors hover:bg-white active:scale-90"
              >
                <Heart
                  size={20}
                  weight={isFavorite ? "fill" : "regular"}
                  className={isFavorite ? "text-brand-teal" : "text-text-default"}
                />
              </button>
            </div>
          </div>

          {/* Bottom Row: Title & Time */}
          <div>
            <h3 className="text-white text-xl font-bold font-['Poppins'] leading-tight line-clamp-2 mb-1">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-white/90">
              <Timer size={18} weight="bold" className="text-white" />
              <span className="text-sm font-['Poppins']">{time} Min.</span>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // --- SMALL CARD (Horizontal) ---
  if (variant === 'small') {
    return (
      <div className={cn("w-[160px] flex-shrink-0", className)}>
        <CardWrapper className="relative">
          {/* Image Container */}
          <div className="h-[140px] rounded-[12px] overflow-hidden relative mb-2">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Favorite Button */}
            <button
              onClick={(e) => { e.preventDefault(); onFavoriteClick?.(); }}
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full transition-colors hover:bg-white"
            >
              <Heart
                size={16}
                weight={isFavorite ? "fill" : "regular"}
                className={isFavorite ? "text-brand-teal" : "text-text-default"}
              />
            </button>

            {/* Time Badge (Bottom Left) */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white/90 ">
              <Timer size={18} weight="bold" className="text-white" />
              <span className="text-sm font-['Poppins']">{time} Min.</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold font-['Poppins'] text-text-default line-clamp-2 leading-tight">
            {title}
          </h3>
        </CardWrapper>
      </div>
    );
  }

  // --- LIST CARD (Medium) ---
  if (variant === 'list') {
    return (
      <CardWrapper className={cn("w-full h-[82px] rounded-[8px] bg-white border border-border-default shadow-card-shadow overflow-hidden flex", className)}>
        {/* Left Image */}
        <div className="w-[110px] h-full flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 p-3 flex flex-col justify-center gap-1 overflow-hidden">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base font-bold font-['Poppins'] text-text-default truncate w-full">
              {title}
            </h3>
            <button
              onClick={(e) => { e.preventDefault(); onFavoriteClick?.(); }}
              className="text-text-default"
            >
              <Heart
                size={20}
                weight={isFavorite ? "fill" : "regular"}
                className={isFavorite ? "text-brand-teal" : "text-text-default"}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center gap-1 text-text-subinfo">
              <Timer size={14} weight="fill" />
              <span className="text-xs font-['Poppins']">{time} Min.</span>
            </div>
            {recipe?.categories?.slice(0, 1).map(cat => (
              <Badge key={cat.id} variant="secondary" className="px-2 py-0.5 h-auto text-[10px] rounded-md">
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // --- OUTLINE CARD (Placeholder) ---
  if (variant === 'outline') {
    return (
      <div
        onClick={onClick}
        className={cn(
          "w-full aspect-[16/9] md:aspect-auto md:h-[200px] border-2 border-dashed border-border-default rounded-[16px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-bg-light-gray transition-colors",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full border border-border-default flex items-center justify-center bg-white shadow-sm">
          <Plus size={24} className="text-text-default" />
        </div>
        <span className="text-text-label font-['Poppins'] text-lg">Rezept auswählen</span>
      </div>
    );
  }

  return null;
};

// Section Header Helper Component
export const RecipeSectionHeader = ({ title, showAll = true, onShowAll, className }) => {
  return (
    <div className={cn("flex justify-between items-center mb-3", className)}>
      <h2 className={cn(
        "font-semibold font-['Poppins'] text-text-default",
        title === "Featured" ? "text-xl" : "text-lg"
      )}>
        {title}
      </h2>
      {showAll && (
        <button
          onClick={onShowAll}
          className="flex items-center gap-1 text-sm font-medium font-['Poppins'] text-brand-teal hover:underline"
        >
          Alle
          <CaretRight size={16} weight="bold" />
        </button>
      )}
    </div>
  );
};

export { RecipeCard };