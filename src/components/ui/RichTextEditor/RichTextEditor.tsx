'use client';

import { useState, useRef, useEffect, useCallback, FormEvent, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
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

// Compatibility interface omitting @deprecated annotations to prevent TS/IDE diagnostics
interface CompatibilityDocument {
  execCommand(commandId: string, showUI?: boolean, value?: string): boolean;
}

function runBrowserCommand(command: string, value: string = ''): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const compatDoc = document as unknown as CompatibilityDocument;
    if (typeof compatDoc.execCommand === 'function') {
      return compatDoc.execCommand(command, false, value);
    }
  } catch {
    // Graceful fallback if restricted
  }
  return false;
}

/**
 * Places the text caret at the end of the specified element.
 */
function setCaretAtEnd(element: HTMLElement) {
  if (typeof window === 'undefined') return;
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Modern DOM inspection of active text formats without relying on deprecated
 * `document.queryCommandState` or `document.queryCommandValue`.
 */
function getActiveFormatsFromSelection(editor: HTMLElement | null): ActiveFormats {
  const defaultFormats: ActiveFormats = {
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

  if (!editor || typeof window === 'undefined') return defaultFormats;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return defaultFormats;

  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer) && !editor.contains(sel.anchorNode)) {
    return defaultFormats;
  }

  const formats: ActiveFormats = { ...defaultFormats };
  const startNodes: (Node | null)[] = [sel.anchorNode, range.commonAncestorContainer];

  for (const startNode of startNodes) {
    let current: Node | null = startNode;
    while (current && current !== editor && editor.contains(current)) {
      if (current instanceof HTMLElement) {
        const tag = current.tagName.toLowerCase();
        const style = window.getComputedStyle(current);

        // 1. Bold
        if (
          tag === 'b' ||
          tag === 'strong' ||
          style.fontWeight === 'bold' ||
          parseInt(style.fontWeight, 10) >= 600
        ) {
          formats.isBold = true;
        }

        // 2. Italic
        if (tag === 'i' || tag === 'em' || style.fontStyle === 'italic') {
          formats.isItalic = true;
        }

        // 3. Underline
        if (tag === 'u' || style.textDecorationLine.includes('underline')) {
          formats.isUnderline = true;
        }

        // 4. Strikethrough
        if (
          tag === 's' ||
          tag === 'strike' ||
          tag === 'del' ||
          style.textDecorationLine.includes('line-through')
        ) {
          formats.isStrike = true;
        }

        // 5. Lists
        if (tag === 'ul') {
          formats.isUnorderedList = true;
        }
        if (tag === 'ol') {
          formats.isOrderedList = true;
        }

        // 6. Blockquote
        if (tag === 'blockquote') {
          formats.isBlockquote = true;
        }

        // 7. Format block (h1, h2, h3, p)
        if (['h1', 'h2', 'h3'].includes(tag)) {
          formats.formatBlock = tag;
        }

        // 8. Text alignment
        const align = current.style.textAlign || current.getAttribute('align') || style.textAlign;
        if (align === 'center' || align === 'right') {
          formats.alignment = align;
        }
      }
      current = current.parentNode;
    }
  }

  return formats;
}

/**
 * Modern DOM transformation for format blocks (h1, h2, h3, p, blockquote).
 */
function applyBlockFormat(editor: HTMLElement, targetTag: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const cleanTag = targetTag.replace(/[<>]/g, '').toLowerCase();

  if (cleanTag === 'blockquote') {
    toggleBlockquote(editor);
    return;
  }

  // Find the closest block container inside editor
  let current: Node | null = sel.anchorNode;
  let targetBlock: HTMLElement | null = null;

  while (current && current !== editor && editor.contains(current)) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      if (['p', 'h1', 'h2', 'h3', 'div'].includes(tag)) {
        targetBlock = current;
        break;
      }
    }
    current = current.parentNode;
  }

  if (targetBlock) {
    if (targetBlock.tagName.toLowerCase() === cleanTag) {
      // Toggle back to paragraph if selecting the same header
      const p = document.createElement('p');
      p.innerHTML = targetBlock.innerHTML || '<br>';
      if (targetBlock.style.textAlign) {
        p.style.textAlign = targetBlock.style.textAlign;
      }
      targetBlock.parentNode?.replaceChild(p, targetBlock);
      setCaretAtEnd(p);
    } else {
      const newBlock = document.createElement(cleanTag);
      newBlock.innerHTML = targetBlock.innerHTML || '<br>';
      if (targetBlock.style.textAlign) {
        newBlock.style.textAlign = targetBlock.style.textAlign;
      }
      targetBlock.parentNode?.replaceChild(newBlock, targetBlock);
      setCaretAtEnd(newBlock);
    }
  } else {
    // If text was directly in editor root
    const newBlock = document.createElement(cleanTag);
    newBlock.innerHTML = editor.innerHTML || '<br>';
    editor.innerHTML = '';
    editor.appendChild(newBlock);
    setCaretAtEnd(newBlock);
  }
}

/**
 * Sets text-align directly on the nearest block element.
 */
function applyAlignment(editor: HTMLElement, alignment: 'left' | 'center' | 'right') {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  let current: Node | null = sel.anchorNode;
  let block: HTMLElement | null = null;

  while (current && current !== editor && editor.contains(current)) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      if (['p', 'h1', 'h2', 'h3', 'div', 'li', 'blockquote'].includes(tag)) {
        block = current;
        break;
      }
    }
    current = current.parentNode;
  }

  if (block) {
    block.style.textAlign = alignment;
  } else if (editor) {
    const p = document.createElement('p');
    p.style.textAlign = alignment;
    p.innerHTML = editor.innerHTML || '<br>';
    editor.innerHTML = '';
    editor.appendChild(p);
    setCaretAtEnd(p);
  }
}

/**
 * Toggles blockquote wrapping/unwrapping.
 */
function toggleBlockquote(editor: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  let current: Node | null = sel.anchorNode;
  let blockquote: HTMLElement | null = null;
  let block: HTMLElement | null = null;

  while (current && current !== editor && editor.contains(current)) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      if (tag === 'blockquote') {
        blockquote = current;
      }
      if (['p', 'h1', 'h2', 'h3', 'div', 'li'].includes(tag) && !block) {
        block = current;
      }
    }
    current = current.parentNode;
  }

  if (blockquote) {
    const parent = blockquote.parentNode;
    const replacement = document.createElement('p');
    replacement.innerHTML = blockquote.innerHTML;
    parent?.replaceChild(replacement, blockquote);
    setCaretAtEnd(replacement);
  } else if (block) {
    const bq = document.createElement('blockquote');
    block.parentNode?.insertBefore(bq, block);
    bq.appendChild(block);
    setCaretAtEnd(block);
  } else {
    const bq = document.createElement('blockquote');
    bq.innerHTML = `<p>${editor.innerHTML || '<br>'}</p>`;
    editor.innerHTML = '';
    editor.appendChild(bq);
    setCaretAtEnd(bq);
  }
}

/**
 * Toggles ordered or unordered list formatting.
 */
function toggleList(editor: HTMLElement, listType: 'ul' | 'ol') {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const command = listType === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
  const success = runBrowserCommand(command);

  if (success) return;

  // DOM fallback
  let current: Node | null = sel.anchorNode;
  let li: HTMLElement | null = null;
  let existingList: HTMLElement | null = null;
  let block: HTMLElement | null = null;

  while (current && current !== editor && editor.contains(current)) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      if (tag === 'li') li = current;
      if (tag === 'ul' || tag === 'ol') existingList = current;
      if (['p', 'h1', 'h2', 'h3', 'div'].includes(tag) && !block) block = current;
    }
    current = current.parentNode;
  }

  if (existingList && li) {
    if (existingList.tagName.toLowerCase() === listType) {
      // Toggle list off: convert li back into p
      const p = document.createElement('p');
      p.innerHTML = li.innerHTML || '<br>';
      existingList.parentNode?.insertBefore(p, existingList);
      li.remove();
      if (!existingList.firstElementChild) {
        existingList.remove();
      }
      setCaretAtEnd(p);
    } else {
      // Switch ul <-> ol
      const newList = document.createElement(listType);
      newList.innerHTML = existingList.innerHTML;
      existingList.parentNode?.replaceChild(newList, existingList);
      setCaretAtEnd(newList);
    }
  } else if (block) {
    const list = document.createElement(listType);
    const newLi = document.createElement('li');
    newLi.innerHTML = block.innerHTML || '<br>';
    list.appendChild(newLi);
    block.parentNode?.replaceChild(list, block);
    setCaretAtEnd(newLi);
  } else {
    const list = document.createElement(listType);
    const newLi = document.createElement('li');
    newLi.innerHTML = editor.innerHTML || '<br>';
    list.appendChild(newLi);
    editor.innerHTML = '';
    editor.appendChild(list);
    setCaretAtEnd(newLi);
  }
}

/**
 * Inserts or wraps selection in an anchor tag.
 */
function insertLinkAtSelection(url: string) {
  if (!url) return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const selectedText = range.toString();
    if (selectedText) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = selectedText;
      a.className = 'text-primary underline hover:opacity-80';
      range.deleteContents();
      range.insertNode(a);
      range.selectNode(a);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
  }
  runBrowserCommand('createLink', url);
}

/**
 * Inserts an image element into the editor at current selection.
 */
function insertImageAtSelection(url: string) {
  if (!url) return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Inserted image';
    img.className = 'max-w-full rounded-xl my-2 border border-primary-medium/20 shadow-xs';
    range.deleteContents();
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
  }
  runBrowserCommand('insertImage', url);
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  className = '',
  minHeight = 'min-h-[110px]',
  showBlockArrow = true,
  showAlignment = true,
  showQuote = true,
  onOpenUploadModal,
}: RichTextEditorProps) {
  const t = useTranslations('tasksPage');
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(DEFAULT_ACTIVE_FORMATS);
  const [isEmpty, setIsEmpty] = useState(true);

  const effectivePlaceholder = placeholder || t('modal.descriptionPlaceholder');

  // Save current selection range
  const saveSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  // Restore saved selection range
  const restoreSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  }, []);

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

  // Inspect current DOM selection to update toolbar state using modern DOM APIs
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    const formats = getActiveFormatsFromSelection(editorRef.current);
    setActiveFormats(formats);
  }, []);

  // Listen to selectionchange to keep formats in sync
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        if (editorRef.current.contains(sel.anchorNode)) {
          saveSelection();
          updateActiveFormats();
        }
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [saveSelection, updateActiveFormats]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    const text = e.currentTarget.innerText || '';
    const cleanEmpty = !text.trim() && (!html || html === '<p><br></p>' || html === '<br>');

    setIsEmpty(cleanEmpty);
    onChange?.(cleanEmpty ? '' : html);
    saveSelection();
    updateActiveFormats();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Support Tab to indent / Shift+Tab to outdent inside lists
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        runBrowserCommand('outdent');
      } else {
        runBrowserCommand('indent');
      }
      saveSelection();
      updateActiveFormats();
      if (editorRef.current) {
        onChange?.(editorRef.current.innerHTML);
      }
    }
  };

  const handleExecuteCommand = (command: string, cmdValue: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    try {
      if (command === 'formatBlock') {
        applyBlockFormat(editorRef.current, cmdValue);
      } else if (
        command === 'justifyLeft' ||
        command === 'justifyCenter' ||
        command === 'justifyRight'
      ) {
        const alignType =
          command === 'justifyCenter' ? 'center' : command === 'justifyRight' ? 'right' : 'left';
        applyAlignment(editorRef.current, alignType);
      } else if (command === 'insertUnorderedList') {
        toggleList(editorRef.current, 'ul');
      } else if (command === 'insertOrderedList') {
        toggleList(editorRef.current, 'ol');
      } else if (command === 'createLink') {
        insertLinkAtSelection(cmdValue);
      } else if (command === 'insertImage') {
        insertImageAtSelection(cmdValue);
      } else {
        runBrowserCommand(command, cmdValue);
      }

      saveSelection();

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
      className={`relative z-20 w-full bg-[#f7f6f2] hover:bg-[#f4f2ec] focus-within:bg-white border border-primary-medium/15 rounded-2xl focus-within:border-primary-dark/40 focus-within:ring-2 focus-within:ring-primary-dark/15 transition-all font-elms ${className}`}
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
      <div className="relative z-0">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={() => {
            saveSelection();
            updateActiveFormats();
          }}
          onMouseUp={() => {
            saveSelection();
            updateActiveFormats();
          }}
          className={`rich-text-editor-content p-3.5 sm:p-4 text-xs sm:text-sm text-primary-dark leading-relaxed focus:outline-none overflow-y-auto max-h-52 rounded-b-2xl ${minHeight}`}
        />

        {/* Floating placeholder when empty */}
        {isEmpty && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 pointer-events-none text-xs sm:text-sm text-primary-medium/55 select-none font-normal"
          >
            {effectivePlaceholder}
          </div>
        )}
      </div>
    </div>
  );
}
