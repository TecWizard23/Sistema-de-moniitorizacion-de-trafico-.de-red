# Prometheus en Windows

En Windows, la forma correcta de alimentar métricas es con `windows_exporter`, no con `node_exporter`.

## Opción recomendada

1. Instala `windows_exporter` en el equipo Windows y verifica que responda en `http://localhost:9182/metrics`.
2. Levanta Prometheus con Docker usando [docker-compose.yml](docker-compose.yml).
3. Arranca la app con Vite.

## Arranque rápido

Desde la raíz del proyecto:

```powershell
docker compose up -d
npm run dev
```

Luego abre:

- Prometheus: `http://localhost:9090`
- Exporter: `http://localhost:9182/metrics`
- Dashboard: `http://localhost:5173`

## Métricas que usa el tablero

- CPU: `windows_cpu_time_total`
- Memoria: `windows_memory_physical_free_bytes` y `windows_memory_physical_total_bytes`
- Red: `windows_net_bytes_total` y `windows_net_current_bandwidth_bytes`

## Variables de entorno

Usa estas variables si necesitas cambiar la configuración:

- `VITE_PROMETHEUS_BASE_URL=/prometheus`
- `VITE_PROMETHEUS_PROXY_TARGET=http://localhost:9090`
- `VITE_PROMETHEUS_PLATFORM=windows`

## Nota

Si Prometheus corre en Docker Desktop sobre Windows, normalmente debes apuntar el scrape de `windows_exporter` a `host.docker.internal:9182`.
