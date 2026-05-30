import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Amazon-style product image lightbox with lens zoom.
 *
 * Features:
 * - Click image to open full-screen overlay
 * - Hover/move over image to see magnified lens view
 * - Pinch-to-zoom (mouse wheel) for additional zoom levels
 * - Keyboard accessible: Escape to close
 * - Smooth animations on open/close
 */
export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowLens(false);
      setZoomLevel(2.5);
      onClose();
    }, 200);
  }, [onClose]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel(prev => {
      const next = prev + (e.deltaY > 0 ? -0.3 : 0.3);
      return Math.max(1.5, Math.min(5, next));
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        isClosing ? 'animate-lightbox-out' : 'animate-lightbox-in'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
          <button
            onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(1.5, prev - 0.5)); }}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/80 text-xs font-mono px-2 min-w-[3rem] text-center">
            {zoomLevel.toFixed(1)}x
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(5, prev + 0.5)); }}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            onClick={(e) => { e.stopPropagation(); setZoomLevel(2.5); }}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Reset zoom"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="p-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Hint text */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <p className="text-white/50 text-xs font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          Hover to zoom • Scroll to adjust • Click outside to close
        </p>
      </div>

      {/* Image container */}
      <div
        className="relative z-[1] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '85vw', maxHeight: '85vh' }}
      >
        {/* Main image with hover lens */}
        <div
          ref={imageRef}
          className="relative cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setShowLens(true)}
          onMouseLeave={() => setShowLens(false)}
          onWheel={handleWheel}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-[85vw] max-h-[85vh] object-contain rounded-lg"
            draggable={false}
          />

          {/* Lens indicator circle */}
          {showLens && (
            <div
              className="absolute pointer-events-none border-2 border-white/50 rounded-full shadow-lg shadow-black/30"
              style={{
                width: 120,
                height: 120,
                left: `calc(${lensPos.x}% - 60px)`,
                top: `calc(${lensPos.y}% - 60px)`,
                background: 'rgba(255,255,255,0.08)',
              }}
            />
          )}
        </div>

        {/* Magnified zoom panel (shown on hover) */}
        {showLens && (
          <div
            className="absolute right-0 translate-x-[calc(100%+16px)] top-0 w-80 h-80 rounded-2xl border-2 border-white/20 shadow-2xl shadow-black/50 overflow-hidden bg-white hidden lg:block"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
            }}
          >
            {/* Zoom level indicator */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded-full">
              {zoomLevel.toFixed(1)}x
            </div>
          </div>
        )}

        {/* Mobile: inline zoom (replace the side panel) */}
        {showLens && (
          <div
            className="absolute inset-0 rounded-lg overflow-hidden lg:hidden pointer-events-none"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
