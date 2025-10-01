// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    Image as ImageIcon,
    FileImage,
    FileCode,
    Download,
    ExternalLink,
    Maximize2,
    Minimize2,
    RotateCw,
    ZoomIn,
    ZoomOut,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Printer,
    Copy,
    Check,
    Loader2,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Document type definitions
type SupportedFileType = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'unknown';

interface DocumentPreviewProps {
    url: string;
    fileName?: string;
    fileType?: string;
    onClose: () => void;
    onDownload?: () => void;
}

// Helper to detect file type from URL or extension
const detectFileType = (url: string, mimeType?: string): SupportedFileType => {
    if (mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType === 'application/pdf') return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('sheet')) return 'spreadsheet';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('slides')) return 'presentation';
    }

    const extension = url.split('.').pop()?.toLowerCase() || '';

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    const docExts = ['doc', 'docx', 'odt', 'rtf', 'txt', 'md'];
    const spreadsheetExts = ['xls', 'xlsx', 'csv', 'ods', 'numbers'];
    const presentationExts = ['ppt', 'pptx', 'odp', 'key'];

    if (imageExts.includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (docExts.includes(extension)) return 'document';
    if (spreadsheetExts.includes(extension)) return 'spreadsheet';
    if (presentationExts.includes(extension)) return 'presentation';

    return 'unknown';
};

// Get icon based on file type
const getFileIcon = (type: SupportedFileType) => {
    switch (type) {
        case 'image': return <ImageIcon className="w-5 h-5" />;
        case 'pdf': return <FileText className="w-5 h-5" />;
        case 'document': return <FileCode className="w-5 h-5" />;
        case 'spreadsheet': return <FileCode className="w-5 h-5" />;
        case 'presentation': return <FileCode className="w-5 h-5" />;
        default: return <FileText className="w-5 h-5" />;
    }
};

// Image Preview Component
const ImagePreview: React.FC<{ url: string; onClose?: () => void }> = ({ url }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => { setScale(1); setRotation(0); setIsZoomed(false); };
    const handleToggleZoom = () => setIsZoomed(!isZoomed);

    return (
        <div className="flex flex-col h-full">
            {/* Image Controls */}
            <div className="flex items-center justify-center gap-2 p-2 bg-white border-b border-gray-200 sticky top-0 z-10">
                <button
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs text-gray-600 min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
                <button
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    onClick={handleRotate}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Rotate"
                >
                    <RotateCw className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    onClick={handleToggleZoom}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title={isZoomed ? "Fit to Screen" : "Zoom to Fit"}
                >
                    {isZoomed ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
                </button>
                <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Reset"
                >
                    <RotateCw className="w-4 h-4 text-gray-600" style={{ transform: 'scaleX(-1)' }} />
                </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
                {loading && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500">Loading image...</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <p className="text-sm text-gray-600">Failed to load image</p>
                        <button
                            onClick={() => { setLoading(true); setError(false); }}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                )}
                <motion.img
                    src={url}
                    alt="Document preview"
                    className="max-w-full max-h-full object-contain cursor-pointer"
                    style={{
                        transform: `scale(${isZoomed ? scale : 1}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease'
                    }}
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                    animate={isZoomed ? { scale } : { scale: 1 }}
                />
            </div>
        </div>
    );
};

// PDF Preview Component with pagination
const PdfPreview: React.FC<{ url: string }> = ({ url }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // For PDF.js integration (optional - for better control)
    useEffect(() => {
        // Reset states when URL changes
        setLoading(true);
        setError(false);
        setNumPages(null);
        setPageNumber(1);
    }, [url]);

    const handleLoad = () => {
        setLoading(false);
        // Attempt to get page count from iframe (if possible)
        // This is a simplified version - consider using PDF.js for full pagination
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

    return (
        <div className="flex flex-col h-full">
            {/* PDF Controls */}
            <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={scale <= 0.5}
                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-600 min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={handleZoomIn}
                        disabled={scale >= 2}
                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-600">
                        Page {pageNumber} {numPages ? `of ${numPages}` : ''}
                    </span>
                    <button
                        onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
                        disabled={numPages ? pageNumber >= numPages : false}
                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* PDF Display */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500">Loading PDF document...</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <p className="text-sm text-gray-600">Failed to load PDF document</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.open(url, '_blank')}
                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                            >
                                Open in New Tab
                            </button>
                            <button
                                onClick={() => { setLoading(true); setError(false); }}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    src={`${url}#page=${pageNumber}&zoom=${Math.round(scale * 100)}`}
                    className="w-full h-full min-h-[500px] rounded-lg border border-gray-200 bg-white shadow-inner"
                    title="PDF Document"
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${100 / scale}%`, height: `${100 / scale}%` }}
                />
            </div>
        </div>
    );
};

// Google Docs Viewer for Microsoft Office files
const OfficePreview: React.FC<{ url: string; fileType: SupportedFileType }> = ({ url, fileType }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const getViewerUrl = () => {
        // Use Google Docs Viewer for Office files
        const encodedUrl = encodeURIComponent(url);
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
    };



    const getFileTypeLabel = () => {
        switch (fileType) {
            case 'document': return 'Word Document';
            case 'spreadsheet': return 'Excel Spreadsheet';
            case 'presentation': return 'PowerPoint Presentation';
            default: return 'Office Document';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Office Controls */}
            <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {getFileIcon(fileType)}
                    <span className="text-sm font-medium text-gray-700">{getFileTypeLabel()}</span>
                </div>
          
            </div>

            {/* Office Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500">Loading document viewer...</p>
                        <p className="text-xs text-gray-400">This may take a moment</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <p className="text-sm text-gray-600">Unable to preview this document</p>
                        <p className="text-xs text-gray-500 max-w-md text-center">
                            The document may be password protected or in an unsupported format.
                            You can download it or open it in a new tab.
                        </p>
                    </div>
                )}
                <iframe
                    src={getViewerUrl()}
                    className="w-full h-full border-0"
                    title="Office Document Viewer"
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                />
            </div>
        </div>
    );
};

// Fallback preview for unsupported files
const UnsupportedPreview: React.FC<{ url: string; fileName?: string; fileType?: string }> = ({ url, fileName, fileType }) => {
    const [copySuccess, setCopySuccess] = useState(false);



    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Preview Not Available</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
                This file type cannot be previewed directly. You can download it or open it in a new tab.
            </p>


        </div>
    );
};

// Main Smart Document Preview Component
export const SmartDocumentPreview: React.FC<DocumentPreviewProps> = ({
    url,
    fileName,
    fileType: providedFileType,
    onClose,
    onDownload
}) => {
    const [fileType, setFileType] = useState<SupportedFileType>('unknown');
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        const detected = detectFileType(url, providedFileType);
        setFileType(detected);
    }, [url, providedFileType]);

 

    const renderPreview = () => {
        switch (fileType) {
            case 'image':
                return <ImagePreview url={url} onClose={onClose} />;
            case 'pdf':
                return <PdfPreview url={url} />;
            case 'document':
            case 'spreadsheet':
            case 'presentation':
                return <OfficePreview url={url} fileType={fileType} />;
            default:
                return <UnsupportedPreview url={url} fileName={fileName} fileType={providedFileType} />;
        }
    };

    const getFileTypeLabel = () => {
        const extension = url.split('.').pop()?.toUpperCase() || '';
        switch (fileType) {
            case 'image': return 'Image';
            case 'pdf': return 'PDF Document';
            case 'document': return `Document${extension ? ` (${extension})` : ''}`;
            case 'spreadsheet': return `Spreadsheet${extension ? ` (${extension})` : ''}`;
            case 'presentation': return `Presentation${extension ? ` (${extension})` : ''}`;
            default: return extension || 'Document';
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="document-preview-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 ${fullscreen ? 'p-0' : ''}`}
                onClick={onClose}
            >
                <motion.div
                    key="document-preview-content"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${fullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-7xl max-h-[95vh]'}`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-primary px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 text-white rounded-lg flex items-center justify-center">
                                {getFileIcon(fileType)}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white leading-tight">
                                    Document Preview
                                </h2>
                                <div className="flex items-center gap-2 text-white/75 text-xs">
                                    <span>{getFileTypeLabel()}</span>
                                    {fileName && (
                                        <>
                                            <span>•</span>
                                            <span className="truncate max-w-[200px]">{fileName}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setFullscreen(!fullscreen)}
                                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                         
                   
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body - Document Viewer */}
                    <div className="flex-1 overflow-hidden bg-gray-100">
                        {renderPreview()}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              
                        <div className="flex items-center gap-3">
                    
                            <button
                                onClick={onClose}
                                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export const useDocumentPreview = () => {
    const [previewState, setPreviewState] = useState<{
        isOpen: boolean;
        url: string;
        fileName?: string;
        fileType?: string;
    }>({
        isOpen: false,
        url: '',
        fileName: undefined,
        fileType: undefined,
    });

    const openPreview = (url: string, fileName?: string, fileType?: string) => {
        setPreviewState({
            isOpen: true,
            url,
            fileName,
            fileType,
        });
    };

    const closePreview = () => {
        setPreviewState({
            isOpen: false,
            url: '',
            fileName: undefined,
            fileType: undefined,
        });
    };

    const PreviewComponent = () => {
        if (!previewState.isOpen) return null;
        return (
            <SmartDocumentPreview
                url={previewState.url}
                fileName={previewState.fileName}
                fileType={previewState.fileType}
                onClose={closePreview}
            />
        );
    };

    return {
        openPreview,
        closePreview,
        PreviewComponent,
        isOpen: previewState.isOpen,
    };
};

export const DocumentLink: React.FC<{
    url: string;
    fileName?: string;
    fileType?: string;
    children?: React.ReactNode;
    className?: string;
    onPreview?: (url: string, fileName?: string, fileType?: string) => void;
}> = ({ url, fileName, fileType, children, className, onPreview }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onPreview) {
            onPreview(url, fileName, fileType);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className || ''}`}
        >
            {children || (
                <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                </>
            )}
        </button>
    );
};

export default SmartDocumentPreview;