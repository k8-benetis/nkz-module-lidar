# LIDAR Module - Nekazari Platform

LIDAR Point Cloud Viewer module for the Nekazari Platform. This module enables visualization of LIDAR point cloud data (LAZ files) from IDENA (Infraestructura de Datos Espaciales de Navarra) in the unified CesiumJS viewer.

## Features

- Download LAZ files from IDENA for selected parcels
- Automatic conversion to 3D Tiles format for CesiumJS
- Interactive point cloud visualization in the unified viewer
- Integration with unified viewer slots (layer-toggle, map-layer, context-panel)

## Architecture

### Backend
- FastAPI service for LIDAR data download and conversion
- REST API endpoints for layer management
- Integration with IDENA data sources

### Frontend
- React application with Module Federation
- Integration with unified viewer via slots
- CesiumJS 3D Tiles visualization

## Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker (for containerized deployment)

### Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
npm install
npm run dev  # Starts on port 5004
```

## Deployment

### Build Docker Images
```bash
# Backend
docker build -f backend/Dockerfile -t ghcr.io/k8-benetis/nkz-module-lidar/lidar-backend:latest .

# Frontend
docker build -f frontend/Dockerfile -t ghcr.io/k8-benetis/nkz-module-lidar/lidar-frontend:latest .
```

### Kubernetes Deployment
```bash
# Apply deployments
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Register module in platform database
psql -h <db-host> -U <user> -d nekazari -f k8s/registration.sql
```

## Module Integration

This module integrates with the Nekazari Platform through:

1. **Module Federation**: Remote module loaded dynamically by the host
2. **Slot System**: Provides widgets for:
   - `layer-toggle`: Layer control widget
   - `map-layer`: CesiumJS 3D Tiles layer
   - `context-panel`: Configuration panel

## API Endpoints

- `GET /api/lidar/layers` - List available LIDAR layers
- `POST /api/lidar/layers` - Create new LIDAR layer (download and convert)
- `GET /api/lidar/layers/{layer_id}` - Get layer details
- `DELETE /api/lidar/layers/{layer_id}` - Delete layer

## Notes

- LAZ to 3D Tiles conversion requires additional tooling (PDAL, 3d-tiles-tools, etc.)
- IDENA data access may require authentication/API keys
- Large point clouds may require significant storage and processing resources

## License

Apache-2.0
