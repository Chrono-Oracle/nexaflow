'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuCloudUpload,
  LuX,
  LuTrash2,
  LuCircleCheck,
  LuLoader,
  LuCircleAlert,
  LuInfo,
} from 'react-icons/lu';
import {
  TaskAttachment,
  UploadingFileItem,
  formatFileSize,
} from './fileUpload.types';
import { FileIconBadge } from './FileIconBadge';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachFiles: (attachments: TaskAttachment[]) => void;
  initialAttachments?: TaskAttachment[];
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export function FileUploadModal({
  isOpen,
  onClose,
  onAttachFiles,
  initialAttachments = [],
}: FileUploadModalProps) {
  const t = useTranslations('fileUpload');
  const [files, setFiles] = useState<UploadingFileItem[]>(() =>
    initialAttachments.map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      formattedSize: att.formattedSize,
      type: att.type,
      progress: 100,
      status: 'completed',
      url: att.url,
    }))
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Clear intervals on unmount
  useEffect(() => {
    const intervals = intervalsRef.current;
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  const handleProcessFiles = (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    if (fileArray.length === 0) return;

    // Check for files exceeding 20 MB
    const oversizedFiles = fileArray.filter((file) => file.size > MAX_FILE_SIZE);
    const validFiles = fileArray.filter((file) => file.size <= MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map((f) => f.name).join(', ');
      setErrorMessage(
        t('oversizedError', { names })
      );
    } else {
      setErrorMessage(null);
    }

    if (validFiles.length === 0) return;

    const newItems: UploadingFileItem[] = validFiles.map((file) => {
      const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        id,
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        type: file.type,
        progress: 10,
        status: 'uploading',
        file,
      };
    });

    setFiles((prev) => [...newItems, ...prev]);

    // Animate progress for each new file
    newItems.forEach((item) => {
      const interval = setInterval(() => {
        setFiles((current) => {
          return current.map((f) => {
            if (f.id !== item.id || f.status !== 'uploading') return f;

            const increment = Math.floor(Math.random() * 20) + 15;
            const newProgress = Math.min(100, f.progress + increment);

            if (newProgress >= 100) {
              clearInterval(intervalsRef.current[item.id]);
              delete intervalsRef.current[item.id];
              return { ...f, progress: 100, status: 'completed' };
            }

            return { ...f, progress: newProgress };
          });
        });
      }, 200);

      intervalsRef.current[item.id] = interval;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      // Reset input value so re-selecting the same file works
      e.target.value = '';
    }
  };

  const handleCancelUpload = (fileId: string) => {
    if (intervalsRef.current[fileId]) {
      clearInterval(intervalsRef.current[fileId]);
      delete intervalsRef.current[fileId];
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const completedFiles = files.filter((f) => f.status === 'completed');
  const hasAtLeastOneFile = completedFiles.length > 0;

  const handleDone = () => {
    const finalAttachments: TaskAttachment[] = completedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      formattedSize: f.formattedSize,
      type: f.type,
      url: f.url || '',
      uploadedAt: new Date().toISOString(),
    }));

    onAttachFiles(finalAttachments);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-elms">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container with slide bouncy effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 28 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 25,
              mass: 0.8,
            }}
            className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-primary-medium/15 z-[61] my-auto space-y-5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-primary-medium/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-surface border border-primary-medium/15 flex items-center justify-center text-primary-dark shadow-2xs">
                  <LuCloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-dark tracking-tight">
                    {t('title')}
                  </h3>
                  <p className="text-xs text-primary-medium/75">
                    {t('subtitle')}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors cursor-pointer"
                aria-label={t('close')}
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-amber-500/10 border border-amber-500/25 text-amber-900 px-3.5 py-2.5 rounded-2xl text-xs flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <LuCircleAlert className="w-4 h-4 shrink-0 text-amber-700" />
                  <span className="font-semibold text-[11.5px] truncate">
                    {errorMessage}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-amber-800 hover:text-amber-950 cursor-pointer shrink-0 p-0.5"
                  aria-label="Dismiss error"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-primary bg-primary-surface/60 scale-[1.01]'
                  : 'border-primary-medium/30 bg-[#faf8f5] hover:border-primary-medium/60'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-primary-medium/15 text-primary-dark flex items-center justify-center shadow-2xs mb-2">
                <LuCloudUpload className="w-5 h-5 text-primary-medium/80" />
              </div>

              <p className="text-xs sm:text-sm font-semibold text-primary-dark tracking-tight">
                {t('dropzoneTitle')}
              </p>
              <p className="text-[11px] text-primary-medium/70 mt-1">
                {t('dropzoneFormats')}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold text-amber-900">
                <LuInfo className="w-3 h-3 text-amber-700 shrink-0" />
                <span>{t('dropzoneNote')}</span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="*/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3.5 px-4 py-2 bg-white hover:bg-primary-surface border border-primary-medium/20 rounded-xl shadow-2xs font-semibold text-xs text-primary-dark transition-all cursor-pointer active:scale-95"
              >
                {t('browseFile')}
              </button>
            </div>

            {/* Uploading & Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {files.map((file) => {
                  const isUploading = file.status === 'uploading';
                  const uploadedBytes = Math.round(
                    (file.size * file.progress) / 100
                  );
                  const formattedUploaded = formatFileSize(uploadedBytes);

                  return (
                    <div
                      key={file.id}
                      className="bg-white rounded-xl border border-primary-medium/15 p-3 shadow-2xs space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* File Badge & Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileIconBadge name={file.name} type={file.type} />

                          <div className="min-w-0 flex-1">
                            <div
                              className="text-xs font-bold text-primary-dark truncate"
                              title={file.name}
                            >
                              {file.name}
                            </div>

                            <div className="text-[10px] text-primary-medium/75 flex items-center gap-1.5 mt-0.5">
                              {isUploading ? (
                                <>
                                  <span>
                                    {t('fileOf', {
                                      uploaded: formattedUploaded,
                                      total: file.formattedSize,
                                    })}
                                  </span>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-primary-dark font-medium">
                                    <LuLoader className="w-3 h-3 animate-spin text-primary" />
                                    <span>{t('uploading')}</span>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span>{file.formattedSize}</span>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                    <LuCircleCheck className="w-3 h-3 stroke-[2.5]" />
                                    <span>{t('completed')}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action: Cancel during upload, or Delete once completed */}
                        <div>
                          {isUploading ? (
                            <button
                              type="button"
                              onClick={() => handleCancelUpload(file.id)}
                              className="w-7 h-7 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface transition-colors flex items-center justify-center cursor-pointer"
                              title={t('cancelUpload')}
                            >
                              <LuX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id)}
                              className="w-7 h-7 rounded-lg text-primary-medium/60 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer"
                              title={t('deleteFile')}
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Animated Progress Bar during upload */}
                      {isUploading && (
                        <div className="w-full h-1.5 bg-primary-medium/15 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-600 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Done Button: Extends down once at least one file has been added */}
            <AnimatePresence>
              {hasAtLeastOneFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 26,
                  }}
                  className="overflow-hidden pt-2 border-t border-primary-medium/10"
                >
                  <button
                    type="button"
                    onClick={handleDone}
                    className="w-full py-3 rounded-xl bg-primary-dark text-white font-semibold text-xs hover:bg-primary active:scale-98 transition-all cursor-pointer shadow-xs"
                  >
                    {t('done', { count: completedFiles.length })}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
