// src/types/entrenamiento.ts

export interface Entrenamiento {
  id?: string      // El ? significa opcional
                   // Cuando CREAS un entrenamiento no tiene id todavía
                   // Firestore lo asigna automáticamente al guardarlo
                   // Cuando lo LEES de Firestore ya viene con id

  fecha: string    // Formato "YYYY-MM-DD" — lo que devuelve el input type="date"
  duracion: number // En minutos — siempre número, nunca string
  distancia: number // En kilómetros — siempre número, nunca string
}