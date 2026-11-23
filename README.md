# Invexia · Backend de Fintrack

API REST en Node.js y Express. Usa Supabase para la autenticación y los datos de la aplicación.

## Requisitos

- Node.js 20 o superior y npm.
- Acceso a un proyecto de Supabase con el esquema base de Fintrack y Supabase Auth configurado para correo y contraseña.

## Instalar y configurar

1. Abre una terminal en la raíz del repositorio y ejecuta `npm ci`.
2. Configura el archivo `.env` de la raíz con la URL y la clave del mismo proyecto de Supabase.

   ```dotenv
   SUPABASE_URL=https://TU_PROYECTO.supabase.co
   SUPABASE_KEY=TU_CLAVE_PUBLICABLE
   PORT=3000
   ```

   `SUPABASE_URL` y `SUPABASE_KEY` son obligatorias. `PORT` es opcional y por defecto vale `3000`. El repositorio versiona `.env`, así que guarda las claves privadas como variables del entorno del servidor.

3. Si habilitas la recuperación de contraseña, puedes configurar `PASSWORD_RESET_REDIRECT_URL` con la URL de la pantalla de recuperación del frontend. Agrega esa URL a los redireccionamientos permitidos de Supabase Auth. Cuando omites la variable, se usa la configuración de redirección de Supabase.

### Base de datos de Supabase

Usa el proyecto de Supabase existente de Fintrack o restaura su esquema base, incluidos los permisos y políticas de acceso, antes de apuntar el backend a un proyecto nuevo. El repositorio no incluye el esquema base.

| Funcionalidad | Objetos que utiliza |
| --- | --- |
| Perfil | `perfiles`, con un registro cuyo `id` coincide con el usuario de Supabase Auth |
| Finanzas | `transacciones`, `categorias`, `cuentas_bancarias`, `presupuestos`, `metas_ahorro` y `aportes_metas` |
| Avisos | `notificaciones` y `recordatorios` |
| Educación | `modulos_educativos`, `lecciones`, `preguntas_quiz`, `progreso_educativo`, `insignias_usuario` y `xp_usuario` |
| Semáforo | `semaforo_financiero` y la función `calcular_semaforo`. La ruta usa el usuario de prueba definido en [el servicio del semáforo](src/services/semaforo.service.js). |

## Arrancar y comprobar

Ejecuta el siguiente comando desde la raíz del repositorio.

```bash
npm run dev
```

El servidor debe mostrar `Servidor corriendo en http://localhost:3000`. En otra terminal, comprueba que Express responde con este comando.

```bash
curl.exe http://localhost:3000/
```

La respuesta contiene `Invexia backend funcionando`. En macOS o Linux puedes usar `curl`.

Para comprobar también Supabase, envía un `POST /api/auth/login` con `Content-Type: application/json` y un cuerpo con `email` y `password` de una cuenta válida. Sustituye `TU_ACCESS_TOKEN` en el siguiente comando por el `session.access_token` de la respuesta.

```bash
curl.exe -i -H "Authorization: Bearer TU_ACCESS_TOKEN" http://localhost:3000/api/transactions
```

Un `200` con un arreglo JSON confirma que funcionan el inicio de sesión y la consulta de transacciones. Si necesitas crear una cuenta, usa `POST /api/auth/register` con `nombre`, `email` y `password` en JSON. La contraseña debe tener al menos ocho caracteres e incluir letras y números. Si Supabase exige confirmar el correo, confirma la cuenta antes de iniciar sesión.

| Si ves este error | Qué revisar |
| --- | --- |
| `supabaseUrl is required` o `supabaseKey is required` | Comprueba las variables de `.env` y ejecuta el comando desde la raíz. |
| `EADDRINUSE` | Cambia `PORT` y usa el nuevo puerto en las solicitudes. |
| `401` en una ruta protegida | Obtén un token vigente del mismo proyecto y envíalo en `Authorization: Bearer …`. |
| Fallan las consultas después de iniciar sesión | Revisa el esquema base, los permisos y las políticas de Supabase. El middleware valida el token, pero las consultas generales usan un cliente compartido y el backend no adjunta el token de cada solicitud a ese cliente. |

## Cómo está organizado el backend

| Archivo o carpeta | Para qué sirve |
| --- | --- |
| `src/routes/` | Define cada URL y los pasos de autenticación y validación que usa. |
| `src/middleware/` | Comprueba la sesión y valida parámetros y cuerpos de solicitudes. |
| `src/controllers/` | Lee los datos de la solicitud, llama al servicio y devuelve la respuesta HTTP. |
| `src/config/` y `src/lib/` | Contienen la configuración de Supabase y utilidades compartidas para fechas, validación y errores. |
| `supabase/migrations/` | Define las tablas y el procedimiento SQL que guarda los datos de Sandbox. |
