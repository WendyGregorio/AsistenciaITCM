# Sistema de Asistencia V2 (Firebase Cloud)

Esta versión utiliza **Firebase Firestore** para guardar los datos en la nube.
- Compatible con Vercel.
- Accesible desde cualquier dispositivo.
- Base de datos centralizada.

## ⚠️ Paso Crítico: Configuración de Firebase

Para que el sistema funcione, necesitas conectar tu propia base de datos gratuita:

1.  Ve a [Firebase Console](https://console.firebase.google.com/) e inicia sesión con Google.
2.  Crea un nuevo proyecto (puedes llamarlo `asistencia-itcm`).
3.  Desactiva "Google Analytics" (no es necesario).
4.  Cuando el proyecto esté listo, busca el ícono de **Web (</>)** para agregar una app.
5.  Ponle un nombre (ej. `web-app`) y registra la app.
6.  **Copia el código de `firebaseConfig`** que te mostrará.
7.  Abre el archivo `firebase-config.js` (ahora en la carpeta principal).
8.  **Reemplaza** el contenido donde dice `TU_API_KEY_AQUI` con tus datos reales.

### Configurar Base de Datos (Firestore)
1.  En el menú lateral de Firebase, ve a **Firestore Database**.
2.  Dale a "Crear base de datos".
3.  Selecciona una ubicación (ej. `us-central` o la que prefieras).
4.  **IMPORTANTE:** Elige comenzar en **modo de prueba** (esto permite leer/escribir sin reglas complejas por 30 días, ideal para prototipos).
5.  LISTO. No necesitas crear tablas, el sistema las crea solas.

## Cómo Subir a Vercel

1.  Sube la carpeta `itcm-attendance-v2` a GitHub.
2.  En Vercel, importa ese repositorio.
3.  Vercel detectará que es un sitio estático.
4.  ¡Deploy!
