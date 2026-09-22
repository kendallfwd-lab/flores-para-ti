# Un jardín para ti · Flores amarillas

Una sola página en JavaScript: cielo azul, nubes volumétricas, pasto, girasoles 3D, mariposas y dedicatorias. Diseñada principalmente para teléfonos, también adaptable a computadora.

## Abrir sin instalar nada

1. Extrae el ZIP completo.
2. En una computadora, abre `index.html` con Chrome, Edge, Firefox o Safari actualizado.
3. Espera la bienvenida «Feliz día de las flores amarillas» y toca un girasol.

`index.html` ya incluye todo: estilos, código y librerías. No necesita internet, API keys ni servidor para funcionar en un navegador de escritorio. Algunos teléfonos abren los HTML descargados en un visor que no ejecuta JavaScript; para esos casos, publica `index.html` en un alojamiento web estático y abre su enlace en el navegador del teléfono.

El jardín 3D requiere un navegador con WebGL 2 y aceleración gráfica. Si no está disponible, aparecen una explicación y los botones de mensajes y carta. El sonido empieza únicamente al activarlo.

## Experiencia e ideas implementadas

1. **Bienvenida animada:** saludo de flores amarillas y transición al jardín después de prepararlo.
2. **Jardín 3D:** girasoles modelados con pétalos, centro de semillas, hojas y tallo. Cielo azul, nubes, colinas verdes, pasto y mariposas.
3. **Flores interactivas:** toca una flor; se mueve, libera corazones dorados y aparece una dedicatoria.
4. **Exploración:** arrastra horizontalmente para desplazar ligeramente el punto de vista.
5. **Una flor para ti:** acceso alternativo con botón y teclado a las dedicatorias.
6. **Hazlo florecer:** una ola de movimiento recorre el jardín.
7. **Una cartita:** carta romántica en una ventana que también se cierra con Escape.
8. **Sonido opcional:** melodía ambiental suave, generada en el navegador, sin grabaciones externas.
9. **Movimiento opcional:** botón para pausarlo y respeto de la preferencia del sistema de reducir movimiento.

## Estructura

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Página final autónoma, lista para abrir o publicar. |
| `src/index.html` | Estructura de la pantalla y los controles. |
| `src/styles.css` | Diseño, tipografía, responsive y presentación de la carta. |
| `src/main.js` | Bienvenida, mensajes, controles e integración. |
| `src/garden.js` | Escena Three.js, iluminación, cámara, selección y animaciones. |
| `src/flowers.js` | Modelo geométrico reutilizable del girasol. |
| `src/audio.js` | Melodía y efectos con Web Audio. |
| `src/config.js` | Mensajes y carta que puedes personalizar. |
| `src/vite.config.js` | Configuración del servidor de desarrollo. |
| `scripts/build.mjs` | Empaqueta código y librerías en el HTML autónomo. |
| `package.json` / `package-lock.json` | Dependencias y comandos reproducibles. |

## Editar desde Visual Studio Code

Necesitas Node.js 22.12 o superior. Abre la carpeta `jardin-para-ti` y su terminal:

```bash
npm install
npm run dev
```

Abre la dirección que indique la terminal. Para comprobarla desde tu teléfono usando el servidor de desarrollo, ambos dispositivos deben estar en la misma red Wi-Fi y debes abrir la dirección de red que muestra Vite; el firewall debe permitir esa conexión.

Cambia los mensajes, párrafos y firma en `src/config.js`. El título y los demás textos de la interfaz están en `src/index.html`. Cambia los colores y tamaños en `src/styles.css`.

Después de editar, regenera el archivo final:

```bash
npm run build
```

El comando reemplaza `index.html` con la versión actualizada. No edites directamente ese archivo si luego vas a regenerarlo.

## Librerías

- Three.js: renderizado y geometría 3D.
- GSAP: transiciones de interfaz y pulsaciones de las flores.
- Lucide: iconos de los controles.
- Vite: servidor para desarrollo.
- esbuild: empaquetado del archivo final.

Se usan versiones fijadas y un lockfile. El HTML final contiene las dependencias necesarias y no hace solicitudes a un CDN. Las licencias están en `licenses/` y los avisos pertinentes se conservan en el código empaquetado.

## Rendimiento y accesibilidad

Las flores y el pasto se dibujan con instancias compartidas. Se reduce la cantidad de flores y la resolución del render en teléfonos. No se utiliza postprocesado, sombras costosas, texturas descargadas ni modelos de gran tamaño. El rendimiento concreto depende del teléfono y su GPU.

Los controles admiten teclado y foco visible, las dedicatorias usan una región anunciable, la carta emplea un diálogo nativo y el sonido es opcional. No se necesita cuenta y no se recopilan datos.

## Comprobaciones realizadas

- Instalación de dependencias y empaquetado terminados correctamente.
- Geometría verificada: vértices finitos, colores presentes y selección mediante raycaster funcionando.
- Comprobación de sintaxis y de que el HTML final no requiere recursos externos.
- No se pudo completar la revisión visual ni la prueba táctil en navegador: la vista previa estaba bloqueada en el entorno de trabajo. Conviene comprobar el resultado en el teléfono destinatario antes de compartirlo.

## Mejoras opcionales para otra versión

- Personalizar la bienvenida con el nombre de la persona.
- Añadir una canción elegida por ustedes con un archivo autorizado.
- Cambiar de un día azul a un atardecer dorado.
- Ocultar una dedicatoria especial que aparezca al descubrir varias flores.

Estas últimas ideas no están implementadas en esta versión.
