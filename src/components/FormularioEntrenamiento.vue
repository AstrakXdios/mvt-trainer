<template>
  <div class="form-card" :class="{ 'editing-mode': isEditing }">

    <!-- Encabezado — cambia según si estamos editando o creando -->
    <div class="form-header">
      <h2 class="form-title">
        {{ isEditing ? '✏️ Editar Entrenamiento' : '➕ Registrar Entrenamiento' }}
      </h2>
      <p class="form-subtitle">
        {{ isEditing ? 'Modifica los datos de tu sesión' : 'Añade una nueva sesión' }}
      </p>

      <!-- Badge visible solo en modo edición -->
      <span v-if="isEditing" class="editing-badge">Editando</span>
    </div>

    <!-- Cuerpo del formulario -->
    <div class="form-body">

      <!-- Campo: Fecha -->
      <div class="field-group">
        <label class="field-label" for="fecha">Fecha del entrenamiento</label>
        <input
          id="fecha"
          v-model="form.fecha"
          type="date"
          class="field-input"
          :class="{ 'field-error': errors.fecha }"
          @input="clearError('fecha')"
        />
        <!-- Mensaje de error, solo visible si existe errors.fecha -->
        <span v-if="errors.fecha" class="error-msg">{{ errors.fecha }}</span>
      </div>

      <!-- Campos en fila: Duración y Distancia -->
      <div class="fields-row">

        <!-- Campo: Duración -->
        <div class="field-group">
          <label class="field-label" for="duracion">Duración (min)</label>
          <input
            id="duracion"
            v-model.number="form.duracion"
            type="number"
            min="1"
            class="field-input"
            :class="{ 'field-error': errors.duracion }"
            placeholder="45"
            @input="clearError('duracion')"
          />
          <!-- .number en v-model convierte el string del input a número automáticamente -->
          <span v-if="errors.duracion" class="error-msg">{{ errors.duracion }}</span>
        </div>

        <!-- Campo: Distancia -->
        <div class="field-group">
          <label class="field-label" for="distancia">Distancia (km)</label>
          <input
            id="distancia"
            v-model.number="form.distancia"
            type="number"
            min="0.1"
            step="0.1"
            class="field-input"
            :class="{ 'field-error': errors.distancia }"
            placeholder="5.0"
            @input="clearError('distancia')"
          />
          <span v-if="errors.distancia" class="error-msg">{{ errors.distancia }}</span>
        </div>

      </div>

      <!-- Preview de estadísticas — solo visible cuando ambos campos tienen valor -->
      <div v-if="form.duracion > 0 && form.distancia > 0" class="stats-preview">
        <div class="stat-chip">
          <span class="stat-label">Ritmo</span>
          <span class="stat-value">{{ pace }} min/km</span>
        </div>
        <div class="stat-chip">
          <span class="stat-label">Velocidad</span>
          <span class="stat-value">{{ speed }} km/h</span>
        </div>
      </div>

      <!-- Error general de envío -->
      <div v-if="submitError" class="submit-error">⚠️ {{ submitError }}</div>

    </div>

    <!-- Botones de acción -->
    <div class="form-actions">

      <!-- Botón cancelar — solo en modo edición -->
      <button
        v-if="isEditing"
        type="button"
        class="btn-secondary"
        @click="cancelEdit"
      >
        Cancelar
      </button>

      <!-- Botón principal -->
      <button
        type="button"
        class="btn-primary"
        :disabled="submitting"
        @click="handleSubmit"
      >
        <!-- Muestra texto o puntos de carga según el estado -->
        {{ submitting ? 'Guardando...' : isEditing ? '✓ Actualizar' : '+ Registrar' }}
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Entrenamiento } from '../types/entrenamiento'

// ─── Props ────────────────────────────────────────────────────
// Este componente recibe el item que se quiere editar (o null si es nuevo)
const props = withDefaults(
  defineProps<{
    editingItem?: Entrenamiento | null
  }>(),
  {
    editingItem: null   // Valor por defecto: null = modo creación
  }
)

// ─── Emits ────────────────────────────────────────────────────
// submit: emite los datos del formulario + opcionalmente el id si es edición
// cancel: emite cuando el usuario cancela la edición
const emit = defineEmits<{
  submit: [data: Omit<Entrenamiento, 'id'>, id?: string]
  cancel: []
}>()

// ─── Estado local ─────────────────────────────────────────────
const form = ref({
  fecha: '',
  duracion: 0,
  distancia: 0
})

// Objeto para los mensajes de error por campo
const errors = ref<Record<string, string>>({})
// Record<string, string> = un objeto donde las claves y valores son strings
// Ejemplo: { fecha: 'La fecha es obligatoria', duracion: 'Valor inválido' }

const submitting = ref(false)
const submitError = ref('')

// true si hay un item siendo editado, false si es modo creación
const isEditing = computed(() => !!props.editingItem)


// Ritmo: minutos por kilómetro
const pace = computed(() => {
  if (form.value.duracion <= 0 || form.value.distancia <= 0) return '-'
  const p = form.value.duracion / form.value.distancia
  const mins = Math.floor(p)
  const secs = Math.round((p - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
  // padStart(2, '0') → si secs es 5, devuelve '05'
})

// Velocidad: kilómetros por hora
const speed = computed(() => {
  if (form.value.duracion <= 0 || form.value.distancia <= 0) return '-'
  return ((form.value.distancia / form.value.duracion) * 60).toFixed(1)
  // * 60 convierte de km/min a km/h
  // toFixed(1) → un decimal: 12.3456 → '12.3'
})

// ─── Watch ────────────────────────────────────────────────────

// Observa cuando cambia editingItem
// Si llega un item → carga sus datos en el formulario
// Si llega null → el formulario ya se limpió (lo hace cancelEdit o handleSubmit)
watch(
  () => props.editingItem,
  (item) => {
    if (item) {
      // Carga los datos del item en el formulario para editarlos
      form.value = {
        fecha: item.fecha,
        duracion: item.duracion,
        distancia: item.distancia
      }
      errors.value = {}
      submitError.value = ''
    }
  }
)

// ─── Funciones ────────────────────────────────────────────────

// Limpia el error de un campo cuando el usuario empieza a corregirlo
function clearError(field: string) {
  delete errors.value[field]
  submitError.value = ''
}

// Valida todos los campos y llena el objeto errors si hay problemas
function validate(): boolean {
  const newErrors: Record<string, string> = {}

  if (!form.value.fecha) {
    newErrors.fecha = 'La fecha es obligatoria'
  }
  if (!form.value.duracion || form.value.duracion <= 0) {
    newErrors.duracion = 'Ingresa una duración válida'
  }
  if (!form.value.distancia || form.value.distancia <= 0) {
    newErrors.distancia = 'Ingresa una distancia válida'
  }

  errors.value = newErrors

  // Retorna true solo si no hay errores
  return Object.keys(newErrors).length === 0
}

// Maneja el envío del formulario
async function handleSubmit() {
  // Primero valida — si hay errores, para aquí
  if (!validate()) return

  submitting.value = true
  submitError.value = ''

  try {
    const data = {
      fecha: form.value.fecha,
      duracion: form.value.duracion,
      distancia: form.value.distancia
    }

    if (isEditing.value && props.editingItem?.id) {
      // Modo edición: emite submit con data + id
      emit('submit', data, props.editingItem.id)
    } else {
      // Modo creación: emite submit solo con data
      emit('submit', data)
      // Limpia el formulario solo si es creación nueva
      form.value = { fecha: '', duracion: 0, distancia: 0 }
    }
  } catch (e: any) {
    submitError.value = e.message
  } finally {
    // finally siempre corre, haya error o no
    submitting.value = false
  }
}

// Cancela la edición y limpia el formulario
function cancelEdit() {
  form.value = { fecha: '', duracion: 0, distancia: 0 }
  errors.value = {}
  submitError.value = ''
  emit('cancel')
}
</script>

<style scoped>
.form-card {
  background: #161820;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;
  position: sticky;
  top: 24px;
}

.form-card.editing-mode {
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 0 40px rgba(59,130,246,0.15);
}

.form-header {
  padding: 28px 28px 0;
  position: relative;
}

.form-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.form-subtitle {
  font-size: 0.85rem;
  color: #8b8fa8;
}

.editing-badge {
  position: absolute;
  top: 28px;
  right: 28px;
  background: rgba(59,130,246,0.15);
  border: 1px solid rgba(59,130,246,0.3);
  color: #3b82f6;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.form-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #8b8fa8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  color: #f0f1f5;
  font-size: 1rem;
  padding: 12px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  font-family: inherit;
}

.field-input:focus {
  border-color: rgba(99,102,241,0.6);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.field-input.field-error {
  border-color: rgba(239,68,68,0.5);
}

.field-input::placeholder { color: #4b4f67; }
.field-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }

.fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.error-msg {
  font-size: 0.75rem;
  color: #ef4444;
}

.stats-preview {
  display: flex;
  gap: 10px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 8px;
  padding: 6px 12px;
}

.stat-label {
  font-size: 0.7rem;
  color: #4b4f67;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #3b82f6;
}

.submit-error {
  font-size: 0.82rem;
  color: #fca5a5;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  padding: 10px 14px;
}

.form-actions {
  padding: 0 28px 28px;
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 13px 20px;
  transition: all 0.2s;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(59,130,246,0.4);
}

.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: rgba(255,255,255,0.06);
  color: #8b8fa8;
  border: 1px solid rgba(255,255,255,0.07);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  color: #f0f1f5;
}
</style>