// =============================================================================
// LIDAR Module - NKZ Platform
// =============================================================================
// LIDAR Point Cloud Viewer Module for Nekazari Platform
//
// IMPORTANT: This component is loaded by the Host, which already provides:
// - NekazariI18nProvider (i18n context)
// - AuthProvider (authentication context)
// - Layout (navigation, sidebar)
//
// This component should NOT wrap itself with providers - it's just the content.
// =============================================================================

import React from 'react';
import { Layers } from 'lucide-react';
import { useAuth, useTranslation } from '@nekazari/sdk';
import { Card, Button } from '@nekazari/ui-kit';
import './index.css';

const LidarApp: React.FC = () => {
  const { user, token, tenantId, isAuthenticated } = useAuth();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Layers className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              LIDAR Point Cloud Viewer
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Visualize LIDAR point cloud data from IDENA in the unified viewer
          </p>
        </div>

        {/* Content Card */}
        <Card padding="lg" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Layers className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  LIDAR Module
                </h2>
                <p className="text-gray-600">
                  This module enables visualization of LIDAR point cloud data (LAZ files) 
                  from IDENA (Infraestructura de Datos Espaciales de Navarra) in the 
                  unified CesiumJS viewer. Select a parcel to download and visualize 
                  LIDAR data.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Download LAZ files from IDENA for selected parcels</li>
                <li>Automatic conversion to 3D Tiles format</li>
                <li>Interactive point cloud visualization in CesiumJS</li>
                <li>Integration with unified viewer slots</li>
              </ul>
            </div>

            {isAuthenticated && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Authenticated as: <span className="font-medium">{user?.email || user?.name}</span>
                  {tenantId && <span className="ml-2">(Tenant: {tenantId})</span>}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Info Box */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-800">
            <strong>Note:</strong> This module integrates with the unified viewer via slots. 
            Use the viewer to select a parcel and access LIDAR controls.
          </p>
        </div>
      </div>
    </div>
  );
};

// CRITICAL: Export as default - required for Module Federation
export default LidarApp;
