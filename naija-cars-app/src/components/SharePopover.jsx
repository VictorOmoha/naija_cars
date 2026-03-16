/**
 * Reusable share popover — shows WhatsApp, Facebook, X, Telegram, Copy Link.
 * Drop-in replacement for every navigator.clipboard / navigator.share call.
 *
 * Usage:
 *   <SharePopover url={shareUrl} text="Check out this car!" />
 *
 * The `url` should be the backend /share/car/:id URL so social bots
 * receive proper OG meta tags and regular users get redirected to the SPA.
 *
 * Uses a React Portal rendered into document.body so the dropdown is NEVER
 * clipped by any parent container with overflow:hidden or overflow-y:auto.
 * Position is calculated from the trigger button's getBoundingClientRect().
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Copy, Check, X } from 'lucide-react';

const WA_ICON = (
  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const FB_ICON = (
  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const X_ICON = (
  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const TG_ICON = (
  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Dropdown height estimate (px) — used to decide open direction
const DROPDOWN_HEIGHT = 268;
const DROPDOWN_WIDTH = 208; // w-52

export default function SharePopover({ url, text, className = '' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, openUp: true });
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  const encoded = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || url);

  const platforms = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}%20${encoded}`,
      bg: 'bg-[#25D366] hover:bg-[#20BD5A]',
      icon: WA_ICON,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: 'bg-[#1877F2] hover:bg-[#166FE5]',
      icon: FB_ICON,
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}&via=naijacars`,
      bg: 'bg-black hover:bg-charcoal-700',
      icon: X_ICON,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encoded}&text=${encodedText}`,
      bg: 'bg-[#229ED9] hover:bg-[#1e8ec2]',
      icon: TG_ICON,
    },
  ];

  // Calculate portal position from the trigger button's screen rect
  const calcPosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow;

    // Align right edge of dropdown with right edge of button
    let left = rect.right - DROPDOWN_WIDTH;
    if (left < 8) left = 8; // keep on screen

    const top = openUp
      ? rect.top - DROPDOWN_HEIGHT - 8
      : rect.bottom + 8;

    setDropPos({ top, left, openUp });
  }, []);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open) calcPosition();
    setOpen(o => !o);
  };

  // Recalculate on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => calcPosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, calcPosition]);

  // Close on outside click (checks both btn and portal drop)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && btnRef.current.contains(e.target)
      ) return;
      if (
        dropRef.current && dropRef.current.contains(e.target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* silent */ }
  };

  const dropdown = open ? (
    <div
      ref={dropRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: dropPos.top,
        left: dropPos.left,
        width: DROPDOWN_WIDTH,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                 border border-pearl-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-pearl-100">
        <p className="text-xs font-semibold text-charcoal-600 uppercase tracking-wide">
          Share listing
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-charcoal-400 hover:text-charcoal-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Platform buttons */}
      <div className="p-2 space-y-1">
        {platforms.map(({ label, href, bg, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 ${bg}
                       text-white text-sm font-medium rounded-xl transition-colors`}
          >
            {icon}
            {label}
          </a>
        ))}

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm
                     font-medium transition-all border-2 ${
                       copied
                         ? 'border-naija-400 bg-naija-50 text-naija-600'
                         : 'border-pearl-200 text-charcoal-700 hover:border-charcoal-300'
                     }`}
        >
          {copied
            ? <Check className="w-4 h-4 flex-shrink-0" />
            : <Copy className="w-4 h-4 flex-shrink-0" />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1.5 p-2 rounded-xl text-charcoal-500
                   hover:text-naija-600 hover:bg-naija-50 transition-colors"
        title="Share"
        aria-label="Share"
        aria-expanded={open}
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Portal — renders outside every overflow:hidden ancestor */}
      {createPortal(dropdown, document.body)}
    </div>
  );
}
