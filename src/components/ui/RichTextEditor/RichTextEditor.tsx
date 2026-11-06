'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { RichTextToolbar, ActiveFormats } from './RichTextToolbar';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showBlockArrow?: boolean;
  showAlignment?: boolean;
  showQuote?: boolean;
  onOpenUploadModal?: () => void;
}

const DEFAULT_ACTIVE_FORMATS: ActiveFormats = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isUnorderedList: false,
  isOrderedList: false,
  isBlockquote: false,
  formatBlock: 'p',
  alignment: 'left',
};

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Add task description...',
  className = '',
  minHeight = 'min-h-[110px]',
  showBlockArrow = true,
  showAlignment = true,
  showQuote = true,
  onOpenUploadModal,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(DEFAULT_ACTIVE_FORMATS);
  const [isEmpty, setIsEmpty] = useState(true);

  // Sync incoming value to editor content if changed externally
  useEffect(() => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      if (value !== currentHtml && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
        setIsEmpty(!value || value === '<p><br></p>' || value === '<br>' || value.trim() === '');
      }
    }
  }, [value]);

  // Inspect current document selection to update toolbar state
  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrike = document.queryCommandState('strikeThrough');
      const isUnorderedList = document.queryCommandState('insertUnorderedList');
      const isOrderedList = document.queryCommandState('insertOrderedList');

      const alignCenter = document.queryCommandState('justifyCenter');
      const alignRight = document.queryCommandState('justifyRight');
      const alignment = alignCenter ? 'center' : alignRight ? 'right' : 'left';

      const blockValue = document.queryCommandValue('formatBlock') || 'p';
      const isBlockquote = blockValue.toLowerCase().includes('blockquote');

      setActiveFormats({
        isBold,
        isItalic,
        isUnderline,
        isStrike,
        isUnorderedList,
        isOrderedList,
        isBlockquote,
        formatBlock: blockValue,
        alignment,
      });
    } catch {
      // Ignore if document commands are unavailable
    }
  }, []);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    const text = e.currentTarget.innerText || '';
    const cleanEmpty = !text.trim() && (!html || html === '<p><br></p>' || html === '<br>');

    setIsEmpty(cleanEmpty);
    onChange?.(cleanEmpty ? '' : html);
    updateActiveFormats();
  };

  const handleExecuteCommand = (command: string, cmdValue: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    try {
      if (command === 'formatBlock') {
        document.execCommand(command, false, cmdValue);
      } else if (command === 'createLink') {
        document.execCommand(command, false, cmdValue);
      } else if (command === 'insertImage') {
        document.execCommand(command, false, cmdValue);
      } else {
        document.execCommand(command, false);
      }

      // Notify parent of updated HTML
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText || '';
      const cleanEmpty = !text.trim() && (!html || html === '<p><br></p>' || html === '<br>');
      setIsEmpty(cleanEmpty);
      onChange?.(cleanEmpty ? '' : html);
      updateActiveFormats();
    } catch (err) {
      console.warn('Rich text command error:', err);
    }
  };

  return (
    <div
      className={`relative w-full bg-[#f7f6f2] hover:bg-[#f4f2ec] focus-within:bg-white border border-primary-medium/15 rounded-2xl overflow-hidden focus-within:border-primary-dark/40 focus-within:ring-2 focus-within:ring-primary-dark/15 transition-all font-elms ${className}`}
    >
      {/* Formatting Toolbar */}
      <RichTextToolbar
        activeFormats={activeFormats}
        onExecuteCommand={handleExecuteCommand}
        showBlockArrow={showBlockArrow}
        showAlignment={showAlignment}
        showQuote={showQuote}
        onOpenUpload={onOpenUploadModal}
      />

      {/* Editor Content Area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          className={`p-3.5 sm:p-4 text-xs sm:text-sm text-primary-dark leading-relaxed focus:outline-none overflow-y-auto max-h-52 ${minHeight}`}
        />

        {/* Floating placeholder when empty */}
        {isEmpty && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 pointer-events-none text-xs sm:text-sm text-primary-medium/55 select-none font-normal"
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
