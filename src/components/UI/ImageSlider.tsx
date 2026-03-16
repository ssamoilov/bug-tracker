import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface ImageSliderProps {
  images: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          navigatePrev();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case 'Escape':
          onClose();
          break;
        case 'Home':
          setCurrentIndex(0);
          break;
        case 'End':
          setCurrentIndex(images.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navigatePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  };

  const navigateNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const handleDownload = async () => {
    const currentImage = images[currentIndex];
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentImage.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop с затемнением и размытием */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" />

      {/* Контент */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
              <span className="text-sm truncate max-w-md">
                {currentImage.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-white hover:bg-white/20"
                icon={isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
                icon={<Download className="w-4 h-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                icon={<X className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Навигация - левая стрелка */}
        {images.length > 1 && (
          <button
            onClick={navigatePrev}
            className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Изображение */}
        <div 
          className={cn(
            "relative max-w-full max-h-full transition-all duration-300",
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={currentImage.url}
            alt={currentImage.name}
            className={cn(
              "max-w-full max-h-full object-contain transition-transform duration-300",
              isZoomed && "scale-150"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Навигация - правая стрелка */}
        {images.length > 1 && (
          <button
            onClick={navigateNext}
            className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Миниатюры снизу */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    index === currentIndex
                      ? "border-primary scale-110"
                      : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};