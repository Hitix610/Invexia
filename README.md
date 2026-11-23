# Invexia · Backend de Fintrack

API REST en Node.js y Express. Usa Supabase para la autenticación y los datos de la aplicación. Belvo Sandbox es opcional.

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

   `SUPABASE_URL` y `SUPABASE_KEY` son obligatorias. `PORT` es opcional y por defecto vale `3000`. El repositorio versiona `.env`, así que guarda las claves privadas como variables del entorno del servidor o en el archivo local ignorado `.env.belvo` para la configuración de Belvo.

3. Si habilitas la recuperación de contraseña, puedes configurar `PASSWORD_RESET_REDIRECT_URL` con la URL de la pantalla de recuperación del frontend. Agrega esa URL a los redireccionamientos permitidos de Supabase Auth. Cuando omites la variable, se usa la configuración de redirección de Supabase.

### Base de datos de Supabase

Usa el proyecto de Supabase existente de Fintrack o restaura su esquema base, incluidos los permisos y políticas de acceso, antes de apuntar el backend a un proyecto nuevo. Las migraciones de este repositorio cubren únicamente Belvo Sandbox.

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
| `src/server.js` | Configura Express, monta las rutas de la API y habilita la página de Belvo en Sandbox. |
| `src/routes/` | Define cada URL y los pasos de autenticación y validación que usa. |
| `src/middleware/` | Comprueba la sesión y valida parámetros y cuerpos de solicitudes. |
| `src/controllers/` | Lee los datos de la solicitud, llama al servicio y devuelve la respuesta HTTP. |
| `src/services/` | Implementa las operaciones del backend y se comunica con Supabase o Belvo. |
| `src/config/` y `src/lib/` | Contienen la configuración de Supabase y utilidades compartidas para fechas, validación y errores. |
| `src/belvo-sandbox/` | Página de prueba para iniciar sesión, abrir el widget, vincular un banco simulado e importar sus datos. |
| `src/scripts/` | Diagnósticos de consola para validar las claves de Belvo y generar un token del widget. |
| `supabase/migrations/` | Define las tablas y el procedimiento SQL que guarda los datos de Sandbox. |

## Probar el widget de Belvo Sandbox (opcional)

1. En el Editor SQL de Supabase, aplica la migración [create_belvo_links](supabase/migrations/20261121000100_create_belvo_links.sql) al proyecto que usa el backend.
2. Crea `.env.belvo` en la raíz con esta configuración. Usa credenciales de Belvo Sandbox y una clave de servidor de Supabase del mismo proyecto. Puedes comprobar las credenciales de Belvo con `npm run belvo:check`.

   ```dotenv
   BELVO_ENV=sandbox
   BELVO_SECRET_ID=TU_ID_DE_SANDBOX
   BELVO_SECRET_PASSWORD=TU_SECRETO_DE_SANDBOX
   SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_DE_SERVIDOR
   ```
3. Ejecuta `npm run dev` y abre [la página de prueba](http://localhost:3000/belvo-sandbox/). Si usas otro dominio o puerto, configura `BELVO_WIDGET_ORIGIN` con el origen exacto desde el que abrirás la página. En un despliegue remoto, usa HTTPS.
4. Inicia sesión con una cuenta de Fintrack, pulsa **Abrir Belvo Sandbox** y completa el consentimiento en el banco simulado. Al volver, la página verifica el vínculo y confirma cuando se guarda.

El token se genera en `POST /api/belvo/widget`. La página recibe el parámetro `link` en el retorno de Belvo y llama a `POST /api/belvo/links` con la sesión de Fintrack. Repetir el guardado no crea filas duplicadas.

## Importar cuentas y movimientos de prueba

1. Aplica [import_belvo_sandbox](supabase/migrations/20261121000200_import_belvo_sandbox.sql) en el mismo proyecto de Supabase y reinicia el backend.
2. En la [página de Sandbox](http://localhost:3000/belvo-sandbox/), selecciona un vínculo guardado y pulsa **Importar cuentas y movimientos**. Si Belvo aún devuelve un listado vacío, vuelve a intentar con el mismo vínculo después de que Belvo termine la carga histórica.
3. Los totales y la vista previa muestran lo guardado. Repetir la importación actualiza los mismos registros y conserva su moneda original.

La ruta autenticada `POST /api/belvo/links/:id/sync` recorre las páginas de Belvo y guarda ambos recursos en una sola transacción. `GET /api/belvo/links/:id/import` devuelve los totales, hasta 20 cuentas y los 20 movimientos más recientes. Las tablas de Sandbox mantienen los datos ficticios fuera de los saldos, reportes y presupuestos habituales.
