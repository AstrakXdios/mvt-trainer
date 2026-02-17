<template>
  <div class="historial">

    <!-- Encabezado con contador -->
    <div class="historial-header">
      <h2 class="historial-title">📋 Historial de Entrenamientos</h2>
      <span v-if="entrenamientos.length" class="count-badge">
        {{ entrenamientos.length }} {{ entrenamientos.length === 1 ? 'sesión' : 'sesiones' }}
      </span>
    </div>

    <!-- Estado: cargando -->
    <div v-if="loading" class="estado-mensaje">
      Cargando entrenamientos...
    </div>

    <!-- Estado: sin datos -->
    <div v-else-if="!entrenamientos.length" class="empty-state">
      <p class="empty-title">Sin entrenamientos aún</p>
      <p class="empty-subtitle">Registra tu primera sesión para empezar</p>
    </div>

    <!-- Lista de tarjetas -->
    <!-- TransitionGroup anima la entrada y salida de cada tarjeta -->
    <TransitionGroup
      v-else
      name="card"
      tag="div"
      class="cards-lista"
    >
      <div
        v-for="item in entrenamientos"
        :key="item.id"
        class="training-card"
        :class="{ 'card-editando': editingId === item.id }"
      >
        <!-- Barra de color lateral — cambia según la distancia -->
        <div class="card-accent" :style="{ background: getColor(item.distancia) }"></div>

        <div class="card-body">

          <!-- Fila superior: fecha y botones -->
          <div class="card-top">
            <div class="card-fecha">
              <span class="fecha-dia">{{ getDia(item.fecha) }}</span>
              <span class="fecha-mes">{{ getMesAnio(item.fecha) }}</span>
            </div>

            <div class="card-acciones">
              <!-- Botón editar -->
              <button
                class="accion-btn btn-editar"
                title="Editar"
                @click="$emit('edit', item)"
              >✏️</button>

              <!-- Botón eliminar — abre confirmación -->
              <button
                class="accion-btn btn-eliminar"
                title="Eliminar"
                @click="pedirConfirmacion(item.id!)"
              >🗑️</button>
            </div>
          </div>

          <!-- Métricas: duración, distancia, ritmo -->
          <div class="card-metricas">
            <div class="metrica">
              <span class="metrica-valor">{{ item.duracion }}</span>
              <span class="metrica-unidad">min</span>
            </div>
            <div class="metrica-divider"></div>
            <div class="metrica">
              <span class="metrica-valor">{{ item.distancia }}</span>
              <span class="metrica-unidad">km</span>
            </div>
            <div class="metrica-divider"></div>
            <div class="metrica">
              <span class="metrica-valor">{{ calcularRitmo(item) }}</span>
              <span class="metrica-unidad">min/km</span>
            </div>
          </div>

        </div>

        <!-- Overlay de confirmación de eliminación -->
        <Transition name="fade">
          <div v-if="eliminandoId === item.id" class="confirmar-overlay">
            <p>¿Eliminar este entrenamiento?</p>
            <div class="confirmar-acciones">
              <button class="btn-cancelar-elim" @click="eliminandoId = null">
                Cancelar
              </button>
              <button class="btn-confirmar-elim" @click="confirmarEliminar(item.id!)">
                Eliminar
              </button>
            </div>
          </div>
        </Transition>

      </div>
    </TransitionGroup>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Entrenamiento } from '../types/entrenamiento'

// ─── Props ────────────────────────────────────────────────────
defineProps<{
  entrenamientos: Entrenamiento[]
  loading: boolean
  editingId?: string | null    // ID del item siendo editado (para resaltar la tarjeta)
}>()

// ─── Emits ────────────────────────────────────────────────────
const emit = defineEmits<{
  edit: [item: Entrenamiento]
  delete: [id: string]
}>()

// ─── Estado local ─────────────────────────────────────────────

// ID del entrenamiento que está esperando confirmación de eliminación
const eliminandoId = ref<string | null>(null)

// ─── Funciones de formato ─────────────────────────────────────

function getDia(fecha: string): string {
  // fecha viene como "2024-03-15"
  // Agregamos T00:00:00 para evitar problemas de zona horaria
  const d = new Date(fecha + 'T00:00:00')
  return d.getDate().toString().padStart(2, '0')
}

function getMesAnio(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-ES', {
    month: 'short',
    year: 'numeric'
  }).toUpperCase()
  // Resultado: "MAR 2024"
}

function calcularRitmo(item: Entrenamiento): string {
  if (!item.duracion || !item.distancia) return '-'
  const ritmo = item.duracion / item.distancia
  const mins = Math.floor(ritmo)
  const secs = Math.round((ritmo - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Color del acento según la distancia recorrida
function getColor(distancia: number): string {
  if (distancia >= 20) return 'linear-gradient(#f59e0b, #ef4444)'  // Naranja/Rojo → élite
  if (distancia >= 10) return 'linear-gradient(#8b5cf6, #ec4899)'  // Morado/Rosa → avanzado
  if (distancia >= 5)  return 'linear-gradient(#3b82f6, #06b6d4)'  // Azul/Cyan → intermedio
  return 'linear-gradient(#10b981, #34d399)'                        // Verde → principiante
}

// ─── Funciones de eliminación ─────────────────────────────────

function pedirConfirmacion(id: string) {
  eliminandoId.value = id    // Muestra el overlay de confirmación en esa tarjeta
}

function confirmarEliminar(id: string) {
  emit('delete', id)         // Avisa a App.vue que elimine este ID
  eliminandoId.value = null  // Cierra el overlay
}
</script>

<style scoped>
.historial { display: flex; flex-direction: column; gap: 20px; }

.historial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.historial-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.count-badge {
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.25);
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.estado-mensaje {
  color: #8b8fa8;
  text-align: center;
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #161820;
  border: 1px dashed rgba(255,255,255,0.07);
  border-radius: 20px;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8b8fa8;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 0.85rem;
  color: #4b4f67;
}

.cards-lista { display: flex; flex-direction: column; gap: 14px; }

/* ── Tarjeta ── */
.training-card {
  position: relative;
  background: #161820;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.training-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.training-card.card-editando {
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 0 20px rgba(59,130,246,0.1);
}

.card-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
}

.card-body { padding: 18px 20px 18px 24px; }

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.card-fecha { display: flex; align-items: baseline; gap: 6px; }

.fecha-dia {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.fecha-mes {
  font-size: 0.72rem;
  font-weight: 600;
  color: #4b4f67;
  letter-spacing: 0.1em;
}

.card-acciones { display: flex; gap: 6px; }

.accion-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: grid;
  place-items: center;
}

.btn-editar:hover {
  background: rgba(59,130,246,0.12);
  border-color: rgba(59,130,246,0.3);
}

.btn-eliminar:hover {
  background: rgba(239,68,68,0.12);
  border-color: rgba(239,68,68,0.3);
}

/* ── Métricas ── */
.card-metricas {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 12px 16px;
}

.metrica { display: flex; align-items: baseline; gap: 4px; }
.metrica-valor { font-size: 1.1rem; font-weight: 700; }
.metrica-unidad { font-size: 0.7rem; color: #4b4f67; }
.metrica-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.07); }

/* ── Overlay confirmación ── */
.confirmar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10,11,15,0.95);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 0.95rem;
  font-weight: 600;
}

.confirmar-acciones { display: flex; gap: 10px; }

.btn-cancelar-elim, .btn-confirmar-elim {
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancelar-elim {
  background: rgba(255,255,255,0.06);
  color: #8b8fa8;
  border: 1px solid rgba(255,255,255,0.07);
}

.btn-cancelar-elim:hover { background: rgba(255,255,255,0.1); color: #f0f1f5; }

.btn-confirmar-elim {
  background: #ef4444;
  color: white;
}

.btn-confirmar-elim:hover { background: #dc2626; }

/* ── Animaciones ── */
.card-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.card-leave-active { transition: all 0.25s ease; }
.card-enter-from { opacity: 0; transform: translateY(16px) scale(0.97); }
.card-leave-to { opacity: 0; transform: translateX(-16px); }
.card-move { transition: transform 0.4s ease; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>