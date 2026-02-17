# 🏃 MVT Trainer — My Virtual Trainer

Aplicación web para el registro y seguimiento de entrenamientos deportivos en tiempo real.

## Demo en vivo

**URL|Repositorio:** [https://https://mtv-trainer.web.app] | (https://github.com/AstrakXdios/mvt-trainer)

## Características

-  Registro de entrenamientos con fecha, duración y distancia
-  Cálculo automático de ritmo (min/km) y velocidad (km/h)
-  Actualización en tiempo real con `onSnapshot` de Firestore
-  Edición y eliminación de registros
-  Validación de formularios con mensajes de error
-  Interfaz responsiva con tema oscuro
-  Sintaxis moderna `<script setup>` de Vue 3

## Tecnologías

- **Vue 3** — Framework frontend
- **TypeScript** — Tipado estático
- **Vite** — Build tool y dev server
- **Firebase Firestore** — Base de datos en tiempo real
- **Firebase Hosting** — Despliegue y hosting

##  Instalación local
```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/mvt-trainer.git
cd mvt-trainer

# Instalar dependencias
npm install

# Configurar Firebase
# Edita src/firebase.ts con tus credenciales de Firebase Console

# Ejecutar en desarrollo
npm run dev
```

## Despliegue
```bash
# Construir para producción
npm run build

# Desplegar en Firebase Hosting
firebase deploy --only hosting
```

## Estructura del proyecto
```
src/
├── components/
│   ├── FormularioEntrenamiento.vue   # Formulario con validación
│   └── HistorialEntrenamientos.vue  # Lista en tiempo real
├── composables/
│   └── useEntrenamientos.ts          # Lógica CRUD + onSnapshot
├── types/
│   └── entrenamiento.ts              # Interfaz TypeScript
├── firebase.ts                        # Configuración Firebase
├── App.vue                            # Componente raíz
└── main.ts                            # Punto de entrada
```

##  Colección Firestore
```typescript
interface Entrenamiento {
  id?: string       // Auto-generado por Firestore
  fecha: string     // "YYYY-MM-DD"
  duracion: number  // Minutos
  distancia: number // Kilómetros
}
```

## Commits del proyecto

1. `feat: estructura inicial del proyecto con Vue 3 + TypeScript + Firebase`
2. `feat: CRUD completo de entrenamientos con onSnapshot en tiempo real`

## Autor

Proyecto de prueba de suficiencia para **My Virtual Trainer** — Puesto: Programador

##  Licencia

MIT