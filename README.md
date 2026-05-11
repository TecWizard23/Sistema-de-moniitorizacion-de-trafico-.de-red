# Dashboard de Monitoreo de Red - Windows

Dashboard interactivo para monitorear la salud de la red y dispositivos conectados en Windows, con métricas de CPU, memoria y tráfico en tiempo real.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-18.3-blue)

## 📋 Características

- **Monitoreo en Tiempo Real**: Panel de control con métricas actualizadas constantemente
- **Métricas del Sistema**:
  - Uso de CPU
  - Utilización de memoria
  - Tráfico de red (Mbps)
  - Salud general de la red
- **Gestión de Dispositivos**: Tabla de dispositivos conectados con direcciones IP y MAC
- **Gráficos de Tráfico**: Visualización temporal del tráfico de red
- **Alertas y Límites**: Sistema de alertas y configuración de límites de ancho de banda
- **Panel de Actividad Viva**: Registro de eventos de red en tiempo real
- **Interfaz Responsiva**: Diseño adaptable con Tailwind CSS

## 🔧 Requisitos Previos

- **Windows 10/11** o superior
- **Node.js** 18+ ([descargar](https://nodejs.org))
- **Docker Desktop** (opcional, para Prometheus en contenedor)
- **windows_exporter**: Exportador de métricas de Windows para Prometheus

### Instalación de windows_exporter

1. Descarga desde: https://github.com/prometheus-community/windows_exporter/releases
2. Ejecuta el instalador (`.msi`)
3. Verifica que responda en: `http://localhost:9182/metrics`

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd Proyecto-redes
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar los servicios

#### Opción A: Con Docker (Recomendado)

```powershell
# Inicia Prometheus en Docker
docker compose up -d

# En otra terminal, inicia la aplicación
npm run dev
```

#### Opción B: Sin Docker

Asegúrate de que Prometheus esté corriendo en tu máquina en `http://localhost:9090`.

```bash
npm run dev
```

### 4. Acceder a la aplicación

- **Dashboard**: `http://localhost:5173`
- **Prometheus**: `http://localhost:9090` (si usas Docker)
- **Windows Exporter**: `http://localhost:9182/metrics`

## 📂 Estructura del Proyecto

```
Proyecto-redes/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AlertsPanel.jsx
│   │   ├── DeviceTable.jsx
│   │   ├── LimitersPanel.jsx
│   │   ├── LimitModal.jsx
│   │   ├── LiveActivity.jsx
│   │   ├── NetworkHealth.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SummaryCard.jsx
│   │   └── TrafficSection.jsx
│   ├── services/            # Servicios
│   │   └── prometheus.js    # Cliente Prometheus
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── backend/
│   ├── server.js            # Servidor Node.js
│   └── data/                # Estado persistente
├── scripts/
│   └── dev.js               # Script de desarrollo
├── docker-compose.yml       # Configuración Docker
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Scripts Disponibles

```bash
# Inicia frontend y backend simultáneamente
npm run dev

# Inicia solo el frontend con Vite
npm run dev:frontend

# Inicia solo el backend
npm run dev:backend

# Construir para producción
npm run build

# Vista previa de la compilación
npm run preview
```

## 🔌 Variables de Entorno

Puedes personalizar la configuración mediante variables de entorno:

```env
VITE_PROMETHEUS_BASE_URL=/prometheus
VITE_PROMETHEUS_PROXY_TARGET=http://localhost:9090
VITE_PROMETHEUS_PLATFORM=windows
```

> **Nota para Windows**: Cuando Prometheus corre en Docker, usa `host.docker.internal:9182` en lugar de `localhost:9182` para conectarse a windows_exporter.

## 📊 Métricas Monitoreadas

El dashboard utiliza las siguientes métricas de Prometheus:

| Métrica                               | Descripción               |
| ------------------------------------- | ------------------------- |
| `windows_cpu_time_total`              | Tiempo total de CPU       |
| `windows_memory_physical_free_bytes`  | Memoria libre disponible  |
| `windows_memory_physical_total_bytes` | Memoria total del sistema |
| `windows_net_bytes_total`             | Bytes totales de red      |
| `windows_net_current_bandwidth_bytes` | Ancho de banda actual     |

## 🛠️ Tecnologías Utilizadas

- **Frontend**:
  - React 18.3
  - Vite 5.4
  - Tailwind CSS 3.4
  - PostCSS

- **Backend**:
  - Node.js
  - HTTP Server nativo

- **Monitoreo**:
  - Prometheus
  - Windows Exporter

## ⚙️ Configuración de Prometheus

El archivo `docker-compose.yml` contiene la configuración para Prometheus. Para máquinas Windows, asegúrate de que el archivo `prometheus.windows.example.yml` tenga la configuración correcta:

```yaml
scrape_configs:
  - job_name: windows
    static_configs:
      - targets: ["host.docker.internal:9182"]
```

## 🐛 Solución de Problemas

### El dashboard no conecta con Prometheus

1. Verifica que Prometheus esté corriendo: `http://localhost:9090`
2. Verifica que windows_exporter esté activo: `http://localhost:9182/metrics`
3. En Docker, revisa que el target sea `host.docker.internal:9182`

### Los datos no se actualizan

- Reinicia windows_exporter
- Comprueba la conectividad: `ping localhost` y `ping host.docker.internal`
- Revisa los logs de Prometheus en Docker: `docker logs <nombre-contenedor>`

### Error "connected=false"

En Windows, el WebSocket podría tener problemas. Soluciones:

- Ejecuta el backend sin `--reload`
- Conecta WS directo al puerto 7777
- Reinicia Docker Desktop

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

**Nota**: Este proyecto está optimizado para Windows con Prometheus. Para otras plataformas, ajusta las métricas y configuración de Prometheus según sea necesario.
