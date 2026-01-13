/**
 * Slot Registration for LIDAR Module
 * Defines all slots that integrate with the Unified Viewer.
 */

import React from 'react';
import LidarLayerControl from '../components/slots/LidarLayerControl';
import { LidarLayer } from '../components/slots/LidarLayer';
import { LidarConfig } from '../components/slots/LidarConfig';
import { LidarProvider } from '../services/lidarContext';

export interface SlotWidgetDefinition {
  id: string;
  component: string;
  priority: number;
  localComponent: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  showWhen?: {
    entityType?: string[];
    layerActive?: string[];
  };
}

export type SlotType = 'layer-toggle' | 'context-panel' | 'bottom-panel' | 'entity-tree' | 'map-layer';

export type ModuleViewerSlots = Record<SlotType, SlotWidgetDefinition[]> & {
  moduleProvider?: React.ComponentType<{ children: React.ReactNode }>;
};

/**
 * LIDAR Module Slots Configuration
 */
export const lidarSlots: ModuleViewerSlots = {
  'map-layer': [
    {
      id: 'lidar-cesium-layer',
      component: 'LidarLayer',
      priority: 10,
      localComponent: LidarLayer
    }
  ],
  'layer-toggle': [
    {
      id: 'lidar-layer-control',
      component: 'LidarLayerControl',
      priority: 10,
      localComponent: LidarLayerControl,
      defaultProps: { visible: true },
      showWhen: { entityType: ['AgriParcel'] }
    }
  ],
  'context-panel': [
    {
      id: 'lidar-config',
      component: 'LidarConfig',
      priority: 20,
      localComponent: LidarConfig,
      defaultProps: { mode: 'panel' },
      showWhen: { entityType: ['AgriParcel'] }
    }
  ],
  'bottom-panel': [],
  'entity-tree': [],
  
  // Host's SlotRenderer wraps all widgets with this provider
  moduleProvider: LidarProvider
};

/**
 * Export as viewerSlots for host integration
 */
export const viewerSlots = lidarSlots;
export default lidarSlots;

