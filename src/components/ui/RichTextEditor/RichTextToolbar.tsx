'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuList,
  LuListOrdered,
  LuLink,
  LuImage,
  LuQuote,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuChevronDown,
  LuCheck,
} from 'react-icons/lu';

export interface ActiveFormats {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isUnorderedList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  formatBlock: string;
  alignment: 'left' | 'center' | 'right';
}

interface RichTextToolbarProps {
  activeFormats: ActiveFormats;
  onExecuteCommand: (command: string, value?: string) => void;
  showBlockArrow?: boolean;
  showAlignment?: boolean;
  showQuote?: boolean;
  onOpenUpload?: () => void;
}

const FORMAT_BLOCK_OPTIONS = [
  { labelKey: 'normalText', value: 'p', defaultLabel: 'Normal text', previewClass: 'text-xs font-normal' },
  { labelKey: 'heading1', value: 'h1', defaultLabel: 'Header 1', previewClass: 'text-base font-bold' },
  { labelKey: 'heading2', value: 'h2', defaultLabel: 'Header 2', previewClass: 'text-sm font-bold' },
  { labelKey: 'heading3', value: 'h3', defaultLabel: 'Header 3', previewClass: 'text-xs font-semibold' },
];

export function RichTextToolbar({
  activeFormats,
  onExecuteCommand,
  showBlockArrow = true,
  showAlignment = true,
  showQuote = true,
  onOpenUpload,
}: RichTextToolbarProps) {
  const t = useTranslations('richText');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const alignMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (blockMenuRef.current && !blockMenuRef.current.contains(e.target as Node)) {
        setShowBlockMenu(false);
      }
      if (alignMenuRef.current && !alignMenuRef.current.contains(e.target as Node)) {
        setShowAlignMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolbarButtonMouseDown = (e: MouseEvent) => {
    // Prevent the button from stealing focus from contentEditable
    e.preventDefault();
  };

  const normalizedBlock = (activeFormats.formatBlock || 'p').replace(/[<>]/g, '').toLowerCase();
  const currentBlock = FORMAT_BLOCK_OPTIONS.find((opt) => opt.value === normalizedBlock);
  const currentBlockLabel = currentBlock
    ? (t(currentBlock.labelKey) || currentBlock.defaultLabel)
    : (t('normalText') || 'Normal text');

  const handleInsertLink = () => {
    const url = window.prompt(t('promptLinkUrl'));
    if (url) {
      onExecuteCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    if (onOpenUpload) {
      onOpenUpload();
      return;
    }
    const url = window.prompt(t('promptImageUrl'));
    if (url) {
      onExecuteCommand('insertImage', url);
    }
  };

  return (
    <div className="relative z-30 flex items-center gap-0.5 sm:gap-1 px-2.5 py-1.5 border-b border-primary-medium/10 bg-[#f4f2ec]/80 flex-wrap sm:flex-nowrap rounded-t-2xl text-primary-dark/85 font-elms select-none">
      {/* 1. Format Block Dropdown (Normal text, Header 1, Header 2, Header 3) */}
      <div className="relative" ref={blockMenuRef}>
        <button
          type="button"
          onMouseDown={handleToolbarButtonMouseDown}
          onClick={() => setShowBlockMenu((prev) => !prev)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-primary-dark hover:bg-white/90 border border-transparent hover:border-primary-medium/15 transition-colors cursor-pointer"
        >
          <span>{currentBlockLabel}</span>
          {showBlockArrow && (
            <LuChevronDown className="w-3 h-3 text-primary-medium/70" />
          )}
        </button>

        {showBlockMenu && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-primary-medium/20 py-1.5 z-50 font-elms">
            {FORMAT_BLOCK_OPTIONS.map((opt) => {
              const isSelected = normalizedBlock === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={handleToolbarButtonMouseDown}
                  onClick={() => {
                    onExecuteCommand('formatBlock', opt.value);
                    setShowBlockMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-surface/50 text-primary-dark font-bold'
                      : 'text-primary-dark/80 hover:bg-primary-surface/30'
                  }`}
                >
                  <span className={opt.previewClass}>
                    {t(opt.labelKey) || opt.defaultLabel}
                  </span>
                  {isSelected && <LuCheck className="w-3.5 h-3.5 text-primary-dark" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <span className="w-px h-4 bg-primary-medium/20 mx-0.5" />

      {/* 2. Alignment Dropdown */}
      {showAlignment && (
        <>
          <div className="relative" ref={alignMenuRef}>
            <button
              type="button"
              onMouseDown={handleToolbarButtonMouseDown}
              onClick={() => setShowAlignMenu((prev) => !prev)}
              className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark border border-transparent hover:border-primary-medium/15 transition-colors cursor-pointer"
              title={t('textAlignment')}
            >
              {activeFormats.alignment === 'center' ? (
                <LuAlignCenter className="w-3.5 h-3.5" />
              ) : activeFormats.alignment === 'right' ? (
                <LuAlignRight className="w-3.5 h-3.5" />
              ) : (
                <LuAlignLeft className="w-3.5 h-3.5" />
              )}
              <LuChevronDown className="w-2.5 h-2.5 text-primary-medium/70" />
            </button>

            {showAlignMenu && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-2xl border border-primary-medium/20 py-1.5 z-50 flex flex-col font-elms">
                <button
                  type="button"
                  onMouseDown={handleToolbarButtonMouseDown}
                  onClick={() => {
                    onExecuteCommand('justifyLeft');
                    setShowAlignMenu(false);
                  }}
                  className={`px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    activeFormats.alignment === 'left'
                      ? 'bg-primary-surface/50 text-primary-dark font-bold'
                      : 'text-primary-dark/80 hover:bg-primary-surface/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LuAlignLeft className="w-3.5 h-3.5" />
                    <span>{t('left')}</span>
                  </div>
                  {activeFormats.alignment === 'left' && (
                    <LuCheck className="w-3.5 h-3.5 text-primary-dark" />
                  )}
                </button>
                <button
                  type="button"
                  onMouseDown={handleToolbarButtonMouseDown}
                  onClick={() => {
                    onExecuteCommand('justifyCenter');
                    setShowAlignMenu(false);
                  }}
                  className={`px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    activeFormats.alignment === 'center'
                      ? 'bg-primary-surface/50 text-primary-dark font-bold'
                      : 'text-primary-dark/80 hover:bg-primary-surface/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LuAlignCenter className="w-3.5 h-3.5" />
                    <span>{t('center')}</span>
                  </div>
                  {activeFormats.alignment === 'center' && (
                    <LuCheck className="w-3.5 h-3.5 text-primary-dark" />
                  )}
                </button>
                <button
                  type="button"
                  onMouseDown={handleToolbarButtonMouseDown}
                  onClick={() => {
                    onExecuteCommand('justifyRight');
                    setShowAlignMenu(false);
                  }}
                  className={`px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    activeFormats.alignment === 'right'
                      ? 'bg-primary-surface/50 text-primary-dark font-bold'
                      : 'text-primary-dark/80 hover:bg-primary-surface/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LuAlignRight className="w-3.5 h-3.5" />
                    <span>{t('right')}</span>
                  </div>
                  {activeFormats.alignment === 'right' && (
                    <LuCheck className="w-3.5 h-3.5 text-primary-dark" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <span className="w-px h-4 bg-primary-medium/20 mx-0.5" />
        </>
      )}

      {/* 3. Bold */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={() => onExecuteCommand('bold')}
        className={`p-1.5 rounded transition-all cursor-pointer ${
          activeFormats.isBold
            ? 'bg-primary-dark text-white shadow-2xs'
            : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
        }`}
        title={t('bold')}
      >
        <LuBold className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* 4. Italic */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={() => onExecuteCommand('italic')}
        className={`p-1.5 rounded transition-all cursor-pointer ${
          activeFormats.isItalic
            ? 'bg-primary-dark text-white shadow-2xs'
            : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
        }`}
        title={t('italic')}
      >
        <LuItalic className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* 5. Underline */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={() => onExecuteCommand('underline')}
        className={`p-1.5 rounded transition-all cursor-pointer ${
          activeFormats.isUnderline
            ? 'bg-primary-dark text-white shadow-2xs'
            : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
        }`}
        title={t('underline')}
      >
        <LuUnderline className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* 6. Strikethrough */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={() => onExecuteCommand('strikeThrough')}
        className={`p-1.5 rounded transition-all cursor-pointer ${
          activeFormats.isStrike
            ? 'bg-primary-dark text-white shadow-2xs'
            : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
        }`}
        title={t('strikeThrough')}
      >
        <LuStrikethrough className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* Divider */}
      <span className="w-px h-4 bg-primary-medium/20 mx-0.5" />

      {/* 7. Bullet List */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={() => onExecuteCommand('insertUnorderedList')}
        className={`p-1.5 rounded transition-all cursor-pointer ${
          activeFormats.isUnorderedList
            ? 'bg-primary-dark text-white shadow-2xs'
            : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
        }`}
        title={t('bulletList')}
      >
        <LuList className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* 8. Numbered List */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={() => onExecuteCommand('insertOrderedList')}
        className={`p-1.5 rounded transition-all cursor-pointer ${
          activeFormats.isOrderedList
            ? 'bg-primary-dark text-white shadow-2xs'
            : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
        }`}
        title={t('numberedList')}
      >
        <LuListOrdered className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* Divider */}
      <span className="w-px h-4 bg-primary-medium/20 mx-0.5" />

      {/* 9. Link */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={handleInsertLink}
        className="p-1.5 rounded hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark transition-all cursor-pointer"
        title={t('insertLink')}
      >
        <LuLink className="w-3.5 h-3.5 stroke-[2.2]" />
      </button>

      {/* 10. Image */}
      <button
        type="button"
        onMouseDown={handleToolbarButtonMouseDown}
        onClick={handleInsertImage}
        className="p-1.5 rounded hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark transition-all cursor-pointer"
        title={t('insertImage')}
      >
        <LuImage className="w-3.5 h-3.5 stroke-[2.2]" />
      </button>

      {/* 11. Quote */}
      {showQuote && (
        <button
          type="button"
          onMouseDown={handleToolbarButtonMouseDown}
          onClick={() => onExecuteCommand('formatBlock', '<blockquote>')}
          className={`p-1.5 rounded transition-all cursor-pointer ${
            activeFormats.isBlockquote
              ? 'bg-primary-dark text-white shadow-2xs'
              : 'hover:bg-white/90 text-primary-dark/80 hover:text-primary-dark'
          }`}
          title={t('blockquote')}
        >
          <LuQuote className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      )}
    </div>
  );
}
