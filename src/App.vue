<template>
  <div class="app">

    <header class="navbar">
      <div class="navbar-inner">
        <div class="brand">🏃 MVT Trainer</div>
        <div class="live-dot-wrap">
          <span class="live-dot"></span>
          <span>En vivo</span>
        </div>
      </div>
    </header>

    <main class="main">

      <!-- Notificación toast -->
      <Transition name="toast">
        <div v-if="toast" class="toast" :class="`toast-${toast.tipo}`">
          {{ toast.mensaje }}
        </div>
      </Transition>

      <div class="grid">

        <!-- Columna izquierda: formulario -->
        <FormularioEntrenamiento
          :editing-item="editandoItem"
          @submit="handleSubmit"
          @cancel="editandoItem = null"
        />

        <!-- Columna derecha: historial -->
        <HistorialEntrenamientos
          :entrenamientos="entrenamientos"
          :loading="loading"
          :editing-id="editandoItem?.id"
          @edit="startEdit"
          @delete="handleDelete"
        />

      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormularioEntrenamiento from './components/FormularioEntrenamiento.vue'
import HistorialEntrenamientos from './components/HistorialEntrenamientos.vue'
import { useEntrenamientos } from './composables/useEntrenamientos'
import type { Entrenamiento } from './types/entrenamiento'

// Composable
const {
  entrenamientos,
  loading,
  agregarEntrenamiento,
  actualizarEntrenamiento,
  eliminarEntrenamiento
} = useEntrenamientos()

// El item siendo editado (null = modo creación)
const editandoItem = ref<Entrenamiento | null>(null)

// Toast notification: null cuando no hay mensaje
const toast = ref<{ mensaje: string; tipo: 'success' | 'error' } | null>(null)


function mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
  toast.value = { mensaje, tipo }
  // Se oculta solo después de 3 segundos
  setTimeout(() => { toast.value = null }, 3000)
}

// Recibe el emit del formulario
// data = los campos, id = existe solo si es edición
async function handleSubmit(data: Omit<Entrenamiento, 'id'>, id?: string) {
  try {
    if (id) {
      await actualizarEntrenamiento(id, data)
      mostrarToast('Entrenamiento actualizado ✓')
      editandoItem.value = null   // Sale del modo edición
    } else {
      await agregarEntrenamiento(data)
      mostrarToast('Entrenamiento registrado ✓')
    }
  } catch (e: any) {
    mostrarToast(e.message, 'error')
  }
}

async function handleDelete(id: string) {
  try {
    await eliminarEntrenamiento(id)
    mostrarToast('Entrenamiento eliminado')
    // Si estábamos editando ese item, cancelamos la edición
    if (editandoItem.value?.id === id) editandoItem.value = null
  } catch (e: any) {
    mostrarToast(e.message, 'error')
  }
}

// Carga el item en el formulario para editarlo
function startEdit(item: Entrenamiento) {
  editandoItem.value = item
}
</script>