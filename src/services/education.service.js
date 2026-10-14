import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'
import { notifySafe } from './notifications.service.js'

// ============================================================
// REGLAS DEL JUEGO (cámbialas aquí si el equipo decide otra cosa)
// ============================================================
export const XP_POR_NIVEL = 100        // cada 100 XP se sube de nivel (nivel = floor(xp/100) + 1)
export const PUNTAJE_APROBATORIO = 60  // % mínimo de acierto para dar un quiz por aprobado

export const calcularNivel = (xp) => Math.floor(xp / XP_POR_NIVEL) + 1

export const datosNivel = (xp) => {
  const nivel = calcularNivel(xp)

  return {
    xp_total: xp,
    nivel_actual: nivel,
    xp_inicio_nivel: (nivel - 1) * XP_POR_NIVEL,
    xp_siguiente_nivel: nivel * XP_POR_NIVEL
  }
}

// opciones es JSONB: [{ texto, es_correcta }]. Se normaliza por si llega como texto o strings sueltos.
export const normalizarOpciones = (opciones) => {
  let arr = opciones

  if (typeof arr === 'string') {
    try {
      arr = JSON.parse(arr)
    } catch {
      arr = []
    }
  }

  if (!Array.isArray(arr)) return []

  return arr.map((o) =>
    typeof o === 'string'
      ? { texto: o, es_correcta: false }
      : { texto: o.texto, es_correcta: o.es_correcta === true }
  )
}

// respuestas[i] = índice de la opción elegida para la pregunta i (preguntas ordenadas por `orden`)
export const calcularResultadoQuiz = (preguntas, respuestas) => {
  const resultados = preguntas.map((q, i) => {
    const opciones = normalizarOpciones(q.opciones)
    const indice_correcto = opciones.findIndex((o) => o.es_correcta)
    const elegida = respuestas[i]

    return {
      pregunta_id: q.id,
      correcta: Number.isInteger(elegida) && elegida === indice_correcto,
      indice_elegido: elegida,
      indice_correcto,
      explicacion: q.explicacion ?? null
    }
  })

  const aciertos = resultados.filter((r) => r.correcta).length
  const total = preguntas.length
  const puntaje = total ? Math.round((aciertos / total) * 100) : 0

  return { resultados, aciertos, total, puntaje, aprobado: puntaje >= PUNTAJE_APROBATORIO }
}

// Estado de cada módulo para un usuario. Función pura (fácil de probar).
// Reglas: el módulo 1 siempre está abierto; los demás se abren al completar el anterior (RF-24).
export const armarEstadoModulos = (modulos, lecciones, progreso, insignias) => {
  const completadas = new Set(progreso.filter((p) => p.completado).map((p) => p.leccion_id))
  const conInsignia = new Set(insignias.map((i) => i.modulo_id))

  let anteriorCompleto = true

  return modulos.map((m, i) => {
    const deModulo = lecciones.filter((l) => l.modulo_id === m.id)
    const total = deModulo.length
    const hechas = deModulo.filter((l) => completadas.has(l.id)).length
    const completo = total > 0 && hechas === total
    const desbloqueado = i === 0 || anteriorCompleto

    // Un módulo sin lecciones no debe bloquear a los siguientes
    anteriorCompleto = total === 0 ? true : completo

    let estado = 'disponible'
    if (!desbloqueado) estado = 'bloqueado'
    else if (completo) estado = 'completado'
    else if (hechas > 0) estado = 'en_curso'

    return {
      id: m.id,
      titulo: m.titulo,
      descripcion: m.descripcion,
      nivel: m.nivel,
      orden: m.orden,
      icono: m.icono,
      color: m.color,
      xp_recompensa: m.xp_recompensa,
      insignia_nombre: m.insignia_nombre,
      total_lecciones: total,
      lecciones_completadas: hechas,
      porcentaje: total ? Math.round((hechas / total) * 100) : 0,
      desbloqueado,
      estado,
      insignia_obtenida: conInsignia.has(m.id)
    }
  })
}

// ============================================================
// Carga de datos
// ============================================================
const cargarEstadoModulos = async (usuario_id) => {
  const [modulos, lecciones, progreso, insignias] = (
    await Promise.all([
      supabase.from('modulos_educativos').select('*').eq('activo', true).order('orden', { ascending: true }),
      supabase.from('lecciones').select('id, modulo_id').eq('activo', true),
      supabase.from('progreso_educativo').select('leccion_id, completado').eq('usuario_id', usuario_id),
      supabase.from('insignias_usuario').select('modulo_id').eq('usuario_id', usuario_id)
    ])
  ).map(must)

  return armarEstadoModulos(modulos, lecciones, progreso, insignias)
}

// Devuelve el estado del módulo o lanza 404 / 403 si no existe o está bloqueado
const exigirModuloDesbloqueado = async (usuario_id, modulo_id) => {
  const estados = await cargarEstadoModulos(usuario_id)
  const modulo = estados.find((m) => m.id === modulo_id)

  if (!modulo) {
    throw new HttpError(404, 'Módulo no encontrado')
  }

  if (!modulo.desbloqueado) {
    throw new HttpError(403, 'Este módulo está bloqueado: completa el anterior primero')
  }

  return modulo
}

// ============================================================
// GET - Módulos con progreso del usuario
// ============================================================
export const getModulesService = async (usuario_id) => cargarEstadoModulos(usuario_id)

// ============================================================
// GET - Lecciones de un módulo
// ============================================================
export const getLessonsService = async (usuario_id, modulo_id) => {
  await exigirModuloDesbloqueado(usuario_id, modulo_id)

  const lecciones = must(
    await supabase
      .from('lecciones')
      .select('id, modulo_id, titulo, tipo, orden, xp_recompensa')
      .eq('modulo_id', modulo_id)
      .eq('activo', true)
      .order('orden', { ascending: true })
  )

  const progreso = must(
    await supabase
      .from('progreso_educativo')
      .select('leccion_id, completado, puntaje_quiz, intentos')
      .eq('usuario_id', usuario_id)
      .eq('modulo_id', modulo_id)
  )

  return lecciones.map((l) => {
    const p = progreso.find((x) => x.leccion_id === l.id)

    return {
      ...l,
      completado: p?.completado ?? false,
      puntaje_quiz: p?.puntaje_quiz ?? null,
      intentos: p?.intentos ?? 0
    }
  })
}

const cargarLeccion = async (leccion_id) => {
  const leccion = must(
    await supabase
      .from('lecciones')
      .select('*')
      .eq('id', leccion_id)
      .eq('activo', true)
      .maybeSingle()
  )

  if (!leccion) {
    throw new HttpError(404, 'Lección no encontrada')
  }

  return leccion
}

const cargarPreguntas = async (leccion_id) =>
  must(
    await supabase
      .from('preguntas_quiz')
      .select('*')
      .eq('leccion_id', leccion_id)
      .order('orden', { ascending: true })
  )

// ============================================================
// GET - Una lección completa. Si es quiz, incluye las preguntas SIN la respuesta correcta.
// ============================================================
export const getLessonService = async (usuario_id, leccion_id) => {
  const leccion = await cargarLeccion(leccion_id)
  await exigirModuloDesbloqueado(usuario_id, leccion.modulo_id)

  const preguntas = await cargarPreguntas(leccion_id)

  return {
    ...leccion,
    preguntas: preguntas.map((q) => ({
      id: q.id,
      orden: q.orden,
      pregunta: q.pregunta,
      opciones: normalizarOpciones(q.opciones).map((o) => o.texto)
    }))
  }
}

// ============================================================
// Suma XP y recalcula el nivel
// ============================================================
const sumarXP = async (usuario_id, xp) => {
  const fila = must(
    await supabase.from('xp_usuario').select('xp_total').eq('usuario_id', usuario_id).maybeSingle()
  )

  const anterior = fila?.xp_total ?? 0
  const total = anterior + xp

  must(
    await supabase.from('xp_usuario').upsert(
      {
        usuario_id,
        xp_total: total,
        nivel_actual: calcularNivel(total),
        actualizado_en: new Date().toISOString()
      },
      { onConflict: 'usuario_id' }
    )
  )

  return { xp_total: total, nivel_anterior: calcularNivel(anterior), nivel_actual: calcularNivel(total) }
}

// ============================================================
// POST - Completar una lección (o responder el quiz)
// respuestas: obligatorio solo si la lección tiene preguntas
// ============================================================
export const completeLessonService = async (usuario_id, leccion_id, respuestas) => {
  const leccion = await cargarLeccion(leccion_id)
  await exigirModuloDesbloqueado(usuario_id, leccion.modulo_id)

  const preguntas = await cargarPreguntas(leccion_id)
  const esQuiz = preguntas.length > 0

  let quiz = null

  if (esQuiz) {
    if (!Array.isArray(respuestas) || respuestas.length !== preguntas.length) {
      throw new HttpError(400, `respuestas debe tener ${preguntas.length} elementos (uno por pregunta)`)
    }

    quiz = calcularResultadoQuiz(preguntas, respuestas)
  }

  const aprobado = esQuiz ? quiz.aprobado : true

  const previo = must(
    await supabase
      .from('progreso_educativo')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('leccion_id', leccion_id)
      .maybeSingle()
  )

  const yaCompletada = previo?.completado === true
  const completada = yaCompletada || aprobado
  const intentos = (previo?.intentos ?? 0) + 1

  // El XP solo se gana la primera vez que se completa la lección
  const xpAhora = aprobado && !yaCompletada ? Number(leccion.xp_recompensa || 0) : 0

  const mejorPuntaje = esQuiz
    ? Math.max(previo?.puntaje_quiz ?? 0, quiz.puntaje)
    : null

  must(
    await supabase.from('progreso_educativo').upsert(
      {
        usuario_id,
        modulo_id: leccion.modulo_id,
        leccion_id,
        completado: completada,
        puntaje_quiz: mejorPuntaje,
        intentos,
        xp_ganado: (previo?.xp_ganado ?? 0) + xpAhora,
        completado_en: completada ? previo?.completado_en ?? new Date().toISOString() : null
      },
      { onConflict: 'usuario_id,leccion_id' }
    )
  )

  let xpInfo = null
  if (xpAhora > 0) {
    xpInfo = await sumarXP(usuario_id, xpAhora)
  }

  // ¿Con esta lección se completó el módulo?
  let moduloCompletado = false
  let insignia = null
  let siguienteDesbloqueado = null
  let xpModuloAhora = 0

  if (completada && !yaCompletada) {
    const leccionesModulo = must(
      await supabase
        .from('lecciones')
        .select('id')
        .eq('modulo_id', leccion.modulo_id)
        .eq('activo', true)
    )

    const hechas = must(
      await supabase
        .from('progreso_educativo')
        .select('leccion_id')
        .eq('usuario_id', usuario_id)
        .eq('modulo_id', leccion.modulo_id)
        .eq('completado', true)
    )

    const idsHechas = new Set(hechas.map((h) => h.leccion_id))
    moduloCompletado = leccionesModulo.length > 0 && leccionesModulo.every((l) => idsHechas.has(l.id))

    if (moduloCompletado) {
      const yaTieneInsignia = must(
        await supabase
          .from('insignias_usuario')
          .select('id')
          .eq('usuario_id', usuario_id)
          .eq('modulo_id', leccion.modulo_id)
          .maybeSingle()
      )

      if (!yaTieneInsignia) {
        must(
          await supabase
            .from('insignias_usuario')
            .insert([{ usuario_id, modulo_id: leccion.modulo_id }])
        )

        const moduloDb = must(
          await supabase
            .from('modulos_educativos')
            .select('titulo, xp_recompensa, insignia_nombre, orden')
            .eq('id', leccion.modulo_id)
            .maybeSingle()
        )

        insignia = { modulo_id: leccion.modulo_id, nombre: moduloDb?.insignia_nombre ?? null }

        xpModuloAhora = Number(moduloDb?.xp_recompensa || 0)
        if (xpModuloAhora > 0) {
          const antes = xpInfo?.nivel_anterior
          xpInfo = await sumarXP(usuario_id, xpModuloAhora)
          // Si ya había subido de nivel con la lección, se conserva el nivel de partida
          if (antes !== undefined) xpInfo.nivel_anterior = antes
        }

        await notifySafe({
          usuario_id,
          tipo: 'educacion',
          titulo: '¡Módulo completado!',
          mensaje: insignia.nombre
            ? `Completaste "${moduloDb.titulo}" y ganaste la insignia ${insignia.nombre}.`
            : `Completaste el módulo "${moduloDb.titulo}".`,
          data: { modulo_id: leccion.modulo_id }
        })

        // ¿Se abrió un módulo nuevo?
        const estados = await cargarEstadoModulos(usuario_id)
        const idx = estados.findIndex((m) => m.id === leccion.modulo_id)
        const siguiente = estados[idx + 1]

        siguienteDesbloqueado = siguiente?.desbloqueado ? siguiente : null

        if (siguienteDesbloqueado) {
          await notifySafe({
            usuario_id,
            tipo: 'educacion',
            titulo: 'Nuevo módulo disponible',
            mensaje: `${siguienteDesbloqueado.titulo} ya está disponible.`,
            data: { modulo_id: siguienteDesbloqueado.id }
          })
        }
      }
    }
  }

  const xpActual =
    xpInfo?.xp_total ??
    must(
      await supabase.from('xp_usuario').select('xp_total').eq('usuario_id', usuario_id).maybeSingle()
    )?.xp_total ??
    0

  return {
    leccion_id,
    modulo_id: leccion.modulo_id,
    completado: completada,
    aprobado,
    quiz,
    xp_ganado_ahora: xpAhora + xpModuloAhora,
    ...datosNivel(xpActual),
    subio_de_nivel: xpInfo ? xpInfo.nivel_actual > xpInfo.nivel_anterior : false,
    modulo_completado: moduloCompletado,
    insignia,
    siguiente_modulo_desbloqueado: siguienteDesbloqueado
      ? { id: siguienteDesbloqueado.id, titulo: siguienteDesbloqueado.titulo }
      : null
  }
}

// ============================================================
// GET - XP, nivel e insignias (pantalla "Mis insignias")
// ============================================================
export const getProgressService = async (usuario_id) => {
  const [xpFila, modulos, insignias] = (
    await Promise.all([
      supabase.from('xp_usuario').select('xp_total').eq('usuario_id', usuario_id).maybeSingle(),
      supabase
        .from('modulos_educativos')
        .select('id, titulo, orden, icono, color, insignia_nombre, insignia_imagen_url')
        .eq('activo', true)
        .order('orden', { ascending: true }),
      supabase.from('insignias_usuario').select('modulo_id, obtenida_en').eq('usuario_id', usuario_id)
    ])
  ).map(must)

  return {
    ...datosNivel(xpFila?.xp_total ?? 0),
    insignias: modulos.map((m) => {
      const obtenida = insignias.find((i) => i.modulo_id === m.id)

      return {
        modulo_id: m.id,
        modulo_titulo: m.titulo,
        orden: m.orden,
        nombre: m.insignia_nombre,
        icono: m.icono,
        color: m.color,
        imagen_url: m.insignia_imagen_url,
        obtenida: Boolean(obtenida),
        obtenida_en: obtenida?.obtenida_en ?? null
      }
    })
  }
}
