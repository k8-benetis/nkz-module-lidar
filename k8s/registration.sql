-- =============================================================================
-- LIDAR Module Registration
-- =============================================================================
-- Register the LIDAR module in the platform database
-- =============================================================================

INSERT INTO external_modules (
    id,
    name,
    display_name,
    version,
    description,
    short_description,
    author_name,
    author_email,
    author_organization,
    category,
    module_type,
    required_plan_type,
    pricing_tier,
    route_path,
    label,
    icon,
    icon_url,
    required_roles,
    dependencies,
    permissions,
    build_config,
    metadata,
    enabled,
    created_at,
    updated_at
) VALUES (
    'lidar',
    'lidar',
    'LIDAR Point Cloud Viewer',
    '1.0.0',
    'Visualize LIDAR point cloud data from IDENA in the unified CesiumJS viewer. Download and convert LAZ files to 3D Tiles for interactive visualization.',
    'LIDAR point cloud visualization for parcel analysis',
    'Nekazari Team',
    'nekazari@artotxiki.com',
    'Nekazari',
    'analytics',
    'ADDON_PAID',
    'premium',
    'PAID',
    '/lidar',
    'LIDAR',
    'layers',
    '/modules/lidar/assets/icon.png',
    ARRAY['Farmer', 'TenantAdmin', 'PlatformAdmin'],
    '{"sdk_version": "^1.0.0", "react_version": "^18.3.1", "platform_version": "^2.0.0"}'::jsonb,
    '{"api_access": ["/api/lidar/*"], "storage_access": true, "external_requests": ["https://idena.navarra.es"]}'::jsonb,
    '{"type": "remote", "remote_entry_url": "/modules/lidar/assets/remoteEntry.js", "scope": "lidar_module", "exposed_module": "./App"}'::jsonb,
    '{"icon": "📊", "color": "#6366F1", "features": ["LIDAR point cloud visualization", "IDENA LAZ file download", "3D Tiles conversion", "Interactive point cloud analysis", "Parcel-based LIDAR data", "CesiumJS integration"], "screenshots": [], "slots": {"layer-toggle": [{"id": "lidar-layer-control", "component": "LidarLayerControl", "priority": 10}], "map-layer": [{"id": "lidar-cesium-layer", "component": "LidarLayer", "priority": 10}], "context-panel": [{"id": "lidar-config", "component": "LidarConfig", "priority": 20, "showWhen": {"entityType": ["AgriParcel"]}}]}}'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    version = EXCLUDED.version,
    description = EXCLUDED.description,
    updated_at = NOW();

