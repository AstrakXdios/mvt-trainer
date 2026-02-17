import { ref, onUnmounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Entrenamiento } from '../types/entrenamiento'

export function useEntrenamientos() {

  // Estado
  
  // Lista de entrenamientos — se actualiza en tiempo real
  const entrenamientos = ref<Entrenamiento[]>([])
  
  // true mientras carga por primera vez
  const loading = ref(true)
  
  // Guarda el mensaje de error si algo falla
  const error = ref<string | null>(null)


  // suscripcion en tiempo real

  // query() construye la consulta a Firestore, en este caso:
  // "dame todos los documentos de la colección 'entrenamientos'
  // ordenada por fecha de más reciente a más antigua"
  const q = query(
    collection(db, 'entrenamientos'),
    orderBy('fecha', 'desc')   // 'desc' = descendente = más reciente primero
  )

  // onSnapshot ejecuta:
  // 1. Inmediatamente al llamarlo (carga inicial)
  // 2. Cada vez que algo cambia en Firestore (tiempo real)
  const cancelarSuscripcion = onSnapshot(
    q,
    (snapshot) => {
      // snapshot.docs es un array de documentos de Firestore
      // Mapeamos cada documento a nuestra interfaz Entrenamiento
      entrenamientos.value = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,          // El ID lo genera Firestore
        ...docSnapshot.data()        // El resto de campos (fecha, duracion, distancia)
      })) as Entrenamiento[]
      
      loading.value = false
    },
    (err) => {
      // Este segundo callback captura errores de Firestore
      error.value = `Error al cargar: ${err.message}`
      loading.value = false
    }
  )

  // Limpieza automática cuando el componente que usa este composable se desmonta
  onUnmounted(() => cancelarSuscripcion())


  //Operaciones CRUD

  // CREAR recibe los datos SIN id (Firestore lo genera)
  async function agregarEntrenamiento(
    data: Omit<Entrenamiento, 'id'>
  ): Promise<void> {
    try {
      // addDoc agrega un documento nuevo a la colección
      // Firestore asigna el ID automáticamente
      await addDoc(collection(db, 'entrenamientos'), data)
    } 
	catch (err: any) {
      // Relanzamos el error para que el componente pueda mostrarlo
      throw new Error(`Error al guardar: ${err.message}`)
    }
  }


  // ACTUALIZAR  necesita el id para saber que documento modificar
  async function actualizarEntrenamiento(
    id: string,
    data: Omit<Entrenamiento, 'id'>
  ): Promise<void> {
    try {
      // doc(db, 'coleccion', id) crea una referencia al documento específico
      await updateDoc(doc(db, 'entrenamientos', id), data)
      
      // onSnapshot detecta el cambio y actualiza la lista solo
    } catch (err: any) {
      throw new Error(`Error al actualizar: ${err.message}`)
    }
  }


  // ELIMINAR solo necesita el id
  async function eliminarEntrenamiento(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'entrenamientos', id))
    } catch (err: any) {
      throw new Error(`Error al eliminar: ${err.message}`)
    }
  }


  // Retorno
  // Todo lo que retorne aquí estará disponible en los componentes
  // que usen este composable
  return {
    // Estado (solo lectura desde afuera)
    entrenamientos,
    loading,
    error,
    
    // Operaciones
    agregarEntrenamiento,
    actualizarEntrenamiento,
    eliminarEntrenamiento
  }
}