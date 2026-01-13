/**
 * LIDAR Layer Control - Enhanced Control Panel
 * 
 * Features:
 * - Check PNOA coverage
 * - Download from PNOA or upload custom .LAZ file
 * - Configure processing options (colorization, tree detection)
 * - Job progress monitoring
 * - Layer management
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Download,
  Upload,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  TreeDeciduous,
  Palette
} from 'lucide-react';
import { useUIKit } from '../../hooks/useUIKit';
import { useLidarContext, ColorMode } from '../../services/lidarContext';

const COLOR_MODE_OPTIONS: { value: ColorMode; label: string; icon: string }[] = [
  { value: 'height', label: 'Altura', icon: '📏' },
  { value: 'ndvi', label: 'NDVI', icon: '🌿' },
  { value: 'rgb', label: 'Color Real', icon: '🎨' },
  { value: 'classification', label: 'Clasificación', icon: '🏷️' },
];

const LidarLayerControl: React.FC = () => {
  const { Card, Button } = useUIKit();
  const {
    selectedEntityId,
    selectedEntityGeometry,
    activeTilesetUrl,
    colorMode,
    setColorMode,
    isProcessing,
    processingJob,
    processingConfig,
    setProcessingConfig,
    startProcessing,
    hasCoverage,
    checkCoverage,
    layers,
    refreshLayers,
  } = useLidarContext();

  const [showSettings, setShowSettings] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check coverage when entity is selected
  useEffect(() => {
    if (selectedEntityGeometry && hasCoverage === null) {
      checkCoverage();
    }
  }, [selectedEntityGeometry, hasCoverage, checkCoverage]);

  // =========================================================================
  // Handlers
  // =========================================================================

  const handleStartProcessing = async () => {
    try {
      setUploadError(null);
      await startProcessing();
    } catch (error: any) {
      setUploadError(error.message || 'Error al procesar');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.laz') && !file.name.toLowerCase().endsWith('.las')) {
      setUploadError('Solo se permiten archivos .LAZ o .LAS');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('El archivo es demasiado grande (máx. 500MB)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parcel_id', selectedEntityId || 'unknown');
      if (selectedEntityGeometry) {
        formData.append('geometry_wkt', selectedEntityGeometry);
      }
      formData.append('config', JSON.stringify(processingConfig));

      // Get auth token
      const auth = (window as any).__nekazariAuth;
      const headers: HeadersInit = {};
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }

      const response = await fetch('/api/lidar/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al subir el archivo');
      }

      const data = await response.json();
      console.log('[LidarLayerControl] Upload started:', data);

      // Refresh layers to show new data
      await refreshLayers();
    } catch (error: any) {
      console.error('[LidarLayerControl] Upload error:', error);
      setUploadError(error.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // =========================================================================
  // Render: No entity selected
  // =========================================================================

  if (!selectedEntityId) {
    return (
      <Card padding="md" className="bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-xl w-full">
        <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
          <Layers className="w-5 h-5" />
          <p>Selecciona una parcela para ver capas LIDAR</p>
        </div>
      </Card>
    );
  }

  // =========================================================================
  // Render: Main Control Panel
  // =========================================================================

  return (
    <Card padding="md" className="bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-xl w-80 shadow-lg pointer-events-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Capas LIDAR
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Settings Panel (Collapsible) */}
        {showSettings && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
            <h4 className="text-sm font-medium text-slate-700">Configuración de procesamiento</h4>

            {/* Color Mode */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                <Palette className="w-3 h-3 inline mr-1" />
                Colorización
              </label>
              <select
                value={processingConfig.colorize_by}
                onChange={(e) => setProcessingConfig({
                  ...processingConfig,
                  colorize_by: e.target.value as ColorMode
                })}
                className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white"
              >
                {COLOR_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tree Detection */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="detect-trees"
                checked={processingConfig.detect_trees}
                onChange={(e) => setProcessingConfig({
                  ...processingConfig,
                  detect_trees: e.target.checked
                })}
                className="rounded border-slate-300"
              />
              <label htmlFor="detect-trees" className="text-xs text-slate-600 flex items-center gap-1">
                <TreeDeciduous className="w-3 h-3" />
                Detectar árboles individuales
              </label>
            </div>

            {/* Tree Detection Options (if enabled) */}
            {processingConfig.detect_trees && (
              <div className="ml-4 space-y-2 text-xs">
                <div>
                  <label className="text-slate-500">Altura mínima (m)</label>
                  <input
                    type="number"
                    value={processingConfig.tree_min_height}
                    onChange={(e) => setProcessingConfig({
                      ...processingConfig,
                      tree_min_height: parseFloat(e.target.value) || 2.0
                    })}
                    min={0.5}
                    max={20}
                    step={0.5}
                    className="w-full border border-slate-200 rounded px-2 py-1 mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-slate-500">Radio de búsqueda (m)</label>
                  <input
                    type="number"
                    value={processingConfig.tree_search_radius}
                    onChange={(e) => setProcessingConfig({
                      ...processingConfig,
                      tree_search_radius: parseFloat(e.target.value) || 3.0
                    })}
                    min={1}
                    max={10}
                    step={0.5}
                    className="w-full border border-slate-200 rounded px-2 py-1 mt-0.5"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && processingJob && (
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-sm font-medium text-indigo-900">
                Procesando...
              </span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2 mb-1">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingJob.progress}%` }}
              />
            </div>
            <p className="text-xs text-indigo-700">
              {processingJob.status_message || 'Procesando nube de puntos...'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {uploadError && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{uploadError}</p>
          </div>
        )}

        {/* Active Layer */}
        {activeTilesetUrl && !isProcessing && (
          <div className="space-y-2">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Capa activa</span>
              </div>

              {/* Color Mode Selector (for active layer) */}
              <div className="flex flex-wrap gap-1 mt-2">
                {COLOR_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColorMode(opt.value)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${colorMode === opt.value
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    title={opt.label}
                  >
                    {opt.icon}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => refreshLayers()}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar capas
            </Button>
          </div>
        )}

        {/* Source Options (when no active layer) */}
        {!activeTilesetUrl && !isProcessing && (
          <div className="space-y-3">
            {/* Coverage Status */}
            {hasCoverage !== null && (
              <div className={`p-2 rounded-lg text-xs ${hasCoverage
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                {hasCoverage
                  ? '✓ Cobertura PNOA disponible'
                  : '⚠ Sin cobertura PNOA automática'
                }
              </div>
            )}

            <p className="text-sm text-slate-600">
              Selecciona una fuente de datos LIDAR:
            </p>

            {/* Option A: Download from PNOA */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartProcessing}
              disabled={isProcessing || !hasCoverage}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {hasCoverage
                ? 'Descargar de PNOA/IDENA'
                : 'Sin cobertura disponible'
              }
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">o</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Option B: Upload custom LAZ file */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".laz,.las"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Subiendo...' : 'Subir archivo .LAZ'}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Archivos de vuelos de dron con georreferenciación
            </p>
          </div>
        )}

        {/* Layers List */}
        {layers.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Capas disponibles
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs"
                >
                  <span className="text-slate-700 truncate flex-1">
                    {layer.source} - {layer.date_observed?.split('T')[0] || 'N/A'}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {layer.point_count ? `${(layer.point_count / 1000000).toFixed(1)}M pts` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LidarLayerControl;
