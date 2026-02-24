# 🔄 Actualizar Agentos - Nuevos Cambios

Este documento explica cómo actualizar tu instalación de Agentos cuando hay nuevos cambios en el repositorio.

## 📋 Pasos para actualizar

### 1. Hacer pull de los cambios

```bash
cd ~/agentos  # o donde tengas el proyecto
git pull origin master
```

### 2. Reconstruir contenedores con los cambios nuevos

```bash
# Reconstruir contenedores con los cambios nuevos
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up --build -d
```

### 3. Si hay cambios en Electron, reinstalar dependencias

```bash
# Si hay cambios en Electron, reinstalar dependencias
cd electron
npm install
cd ..
```

## ✅ Verificar que todo funciona

```bash
# Verificar que los servicios estén corriendo
docker compose -f docker-compose.dev.yml ps

# Verificar que el frontend responda
curl http://localhost:3000

# Verificar que el backend responda
curl http://localhost:3001/api/ping
```

## 🆘 Si algo falla

Si después de actualizar hay problemas:

1. **Revisar logs:**
   ```bash
   docker compose -f docker-compose.dev.yml logs -f
   ```

2. **Resetear completamente (borra todos los datos):**
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml up --build -d
   ```

3. **Clonar de nuevo (último recurso):**
   ```bash
   cd ~
   rm -rf agentos
   git clone https://github.com/Roberto-rgb-code/agentos.git agentos
   cd agentos
   docker compose -f docker-compose.dev.yml up --build -d
   ```

## 📝 Notas

- Los datos de la base de datos se mantienen en volúmenes Docker, así que no se perderán al actualizar
- Si hay cambios en el esquema de la base de datos, Prisma aplicará las migraciones automáticamente
- El frontend y backend se reconstruyen automáticamente con `--build`

