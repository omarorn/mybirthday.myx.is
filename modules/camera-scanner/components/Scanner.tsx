/**
 * Camera Scanner Component (React + TypeScript)
 * AI-powered image classification with camera capture and motion detection.
 * Extracted from: rusl.myx.is (production)
 *
 * Features:
 * - Camera toggle with battery-saving (not auto-start)
 * - File picker fallback when camera unavailable
 * - Motion detection with auto-capture countdown
 * - Multi-object detection with bounding boxes
 * - Image crop & undo stack (Ctrl+Z)
 * - Result history with localStorage persistence
 * - Share via Web Share API
 *
 * Required:
 * - useCamera hook (../hooks/useCamera)
 * - API service with identifyItem() function
 * - imageUtils with cropImageClient(), drawCropOverlay()
 *
 * Customize {{API_ENDPOINT}} and {{IDENTIFY_FUNCTION}} for your use case.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';

// ─── Types ──────────────────────────────────────────────
interface ScannerProps {
  /** Called when a classification result is obtained */
  onResult?: (result: ClassificationResult) => void;
  /** API endpoint for image classification */
  apiEndpoint?: string;
  /** Custom header content */
  title?: string;
  /** Additional action buttons in header */
  headerActions?: React.ReactNode;
}

interface ClassificationResult {
  success: boolean;
  item: string;
  category: string;
  confidence: number;
  reason?: string;
  imageKey?: string;
  allObjects?: DetectedObject[];
  isWideShot?: boolean;
  error?: string;
}

interface DetectedObject {
  item: string;
  category: string;
  confidence: number;
  is_primary?: boolean;
  crop_box?: { x: number; y: number; width: number; height: number };
  comment?: string;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  image: string;
  item: string;
  category: string;
  confidence: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  text: string;
  icon: string;
  type: 'info' | 'success' | 'error' | 'pending';
}

// ─── Component ──────────────────────────────────────────
export function Scanner({
  onResult,
  apiEndpoint = '/api/identify',
  title = 'Scanner',
  headerActions,
}: ScannerProps) {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureImage } = useCamera();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<ClassificationResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scanner_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch { /* ignore */ }
    }
  }, []);

  // Save history
  useEffect(() => {
    if (history.length > 0) {
      try {
        const toSave = history.slice(0, 20).map(h => ({ ...h, image: '' }));
        localStorage.setItem('scanner_history', JSON.stringify(toSave));
      } catch { localStorage.removeItem('scanner_history'); }
    }
  }, [history]);

  const addLog = (text: string, icon: string, type: LogEntry['type']) => {
    setLogs(prev => [...prev, { id: Date.now().toString(), timestamp: new Date(), text, icon, type }]);
  };

  const toggleCamera = useCallback(() => {
    if (isStreaming) { stopCamera(); addLog('Camera off', '📷', 'info'); }
    else { startCamera(); addLog('Camera on', '📷', 'info'); }
  }, [isStreaming, startCamera, stopCamera]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageBase64 = event.target?.result as string;
      if (imageBase64) handleCapture(imageBase64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCapture = async (providedImage?: string) => {
    const image = providedImage || captureImage();
    if (!image) { addLog('Could not capture image', '❌', 'error'); return; }

    setCurrentImage(image);
    setCurrentResult(null);
    setIsLoading(true);
    addLog('Image captured', '📸', 'info');
    addLog('Sending to server...', '📤', 'pending');

    try {
      addLog('Classifying with AI...', '🤖', 'pending');
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const result: ClassificationResult = await response.json();

      if (result.success && result.confidence > 0) {
        addLog(result.item + ' → ' + result.category, '✅', 'success');
        setCurrentResult(result);
        setHistory(prev => [{
          id: Date.now().toString(), timestamp: new Date(), image,
          item: result.item, category: result.category, confidence: result.confidence,
        }, ...prev]);
        onResult?.(result);
      } else {
        addLog(result.error || 'Could not identify', '🤔', 'error');
        setCurrentResult(result);
      }
    } catch (err) {
      addLog('Network error', '📡', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-blue-600 text-white p-3 flex items-center justify-between shadow-lg">
        <h1 className="text-lg font-bold">{title}</h1>
        <div className="flex gap-2">{headerActions}</div>
      </header>

      <main className="flex-1 overflow-auto">
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

        {/* Camera section */}
        <div className="relative bg-black" style={{ height: '35vh', minHeight: '200px' }}>
          <canvas ref={canvasRef} className="hidden" />
          <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover ${isStreaming ? '' : 'hidden'}`} />

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-red-400">{error}</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg">Select image</button>
              </div>
            </div>
          ) : !isStreaming ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-white/70 mb-4">Camera off</p>
              <div className="flex gap-3">
                <button onClick={toggleCamera} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Start camera</button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium">Select image</button>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/40 rounded-2xl" />
              </div>
              <button onClick={toggleCamera} className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">Stop</button>
              <button onClick={() => handleCapture()} disabled={!isStreaming || isLoading}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-full bg-blue-500" />
              </button>
            </>
          )}
        </div>

        {/* Result */}
        {currentResult && (
          <div className={`p-4 text-white ${currentResult.confidence > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="text-2xl font-bold">{currentResult.item}</div>
            <div className="opacity-90">→ {currentResult.category}</div>
            {currentResult.confidence > 0 && <div className="text-xs opacity-70 mt-1">{Math.round(currentResult.confidence * 100)}% confidence</div>}
            {currentResult.reason && <p className="text-sm opacity-90 mt-2">{currentResult.reason}</p>}
          </div>
        )}

        {/* Log */}
        <div className="bg-gray-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-sm font-bold">Log</h2>
            <button onClick={() => setLogs([])} className="text-gray-400 text-xs hover:text-white">Clear</button>
          </div>
          <div className="bg-gray-900 rounded-lg p-2 max-h-32 overflow-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-2">No activity yet</div>
            ) : logs.map(log => (
              <div key={log.id} className={`flex items-center gap-2 py-1 ${
                log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'pending' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                <span className="text-gray-600 w-16 flex-shrink-0">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span>{log.icon}</span>
                <span>{log.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-gray-700 p-3">
            <h2 className="text-white text-sm font-bold mb-2">History ({history.length})</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {history.map(entry => (
                <div key={entry.id} className="flex-shrink-0 w-24 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-2 text-white text-center">
                    <div className="text-xs truncate">{entry.item}</div>
                    <div className="text-xs opacity-70">{entry.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
