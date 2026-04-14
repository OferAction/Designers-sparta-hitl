import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassPlusIcon as ZoomIn, MagnifyingGlassMinusIcon as ZoomOut, XIcon as X, ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, FileIcon as FileText } from '@phosphor-icons/react';
import { Attachment } from '@/hq/types';

export interface LightboxProps {
  attachments: Attachment[];
  initialIndex: number;
  onClose: () => void;
}

/** Full-screen modal for viewing attachments — supports single file and multi-file carousel */
export default function AttachmentModal({ attachments, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const lastWheelRef = useRef(0);
  const stripRef = useRef<HTMLDivElement>(null);

  const current = attachments[index];
  const isMulti = attachments.length > 1;

  function goTo(i: number) {
    setIndex(i);
    setZoom(1);
  }
  function goPrev() { if (index > 0) goTo(index - 1); }
  function goNext() { if (index < attachments.length - 1) goTo(index + 1); }

  // Scroll active thumbnail into view in the strip
  useEffect(() => {
    if (!stripRef.current) return;
    const active = stripRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const now = performance.now();
    if (now - lastWheelRef.current < 16) return;
    lastWheelRef.current = now;
    setZoom((z) => Math.min(4, Math.max(0.25, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')                  onCloseRef.current();
      if (e.key === 'ArrowLeft')               goPrev();
      if (e.key === 'ArrowRight')              goNext();
      if (e.key === '+' || e.key === '=')      setZoom((z) => Math.min(4, z + 0.2));
      if (e.key === '-')                        setZoom((z) => Math.max(0.25, z - 0.2));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85" onClick={onClose}>
      {/* Toolbar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3"
        style={{ background: 'hsl(var(--popover))', borderBottom: '1px solid var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>{current.name}</span>
          {isMulti && (
            <span className="text-xs flex-shrink-0" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
              ({index + 1} of {attachments.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:opacity-80" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono w-12 text-center" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(4, z + 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:opacity-80" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-5" style={{ background: 'var(--border-subtle)' }} />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:opacity-80" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Image area with optional prev/next arrows */}
      <div
        className="flex-1 relative overflow-auto flex items-center justify-center p-8"
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === 'image' && current.url ? (
          <img
            src={current.url}
            alt={current.name}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s', maxWidth: '100%', maxHeight: '100%' }}
            className="shadow-2xl object-contain"
            draggable={false}
          />
        ) : (
          /* Non-image fallback */
          <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <FileText size={64} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{current.name}</span>
            {current.url && (
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Open in new tab ↗
              </a>
            )}
          </div>
        )}

        {/* Prev arrow */}
        {isMulti && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            disabled={index === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
        )}

        {/* Next arrow */}
        {isMulti && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            disabled={index === attachments.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <ArrowRight size={18} color="white" />
          </button>
        )}
      </div>

      {/* File strip — only when multiple files */}
      {isMulti && (
        <div
          ref={stripRef}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-3 overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {attachments.map((file, i) => (
            <button
              key={i}
              data-active={i === index ? 'true' : 'false'}
              onClick={() => goTo(i)}
              className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-all overflow-hidden"
              style={{
                outline: i === index ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                outlineOffset: '1px',
                opacity: i === index ? 1 : 0.6,
              }}
            >
              {file.type === 'image' && file.url ? (
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <FileText size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
