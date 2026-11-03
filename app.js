// Configuración de idioma de DayJS
dayjs.locale('es');

// ANIMACIONES DE INICIO Y CARGA CON ANIME.JS
document.addEventListener("DOMContentLoaded", () => {
    // Animación de aparición para el Spinner Orbital
    anime({
        targets: '.spinner-orbital',
        rotate: '1turn',
        duration: 1200,
        easing: 'linear',
        loop: true
    });

    // Animación de entrada general al cargar la página
    anime({
        targets: '.tarjeta-cosmica',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
        duration: 800,
        easing: 'easeOutCubic'
    });

    // Llamada inicial para cargar la imagen astronómica
    cargarFotografiaAstronomica();
});

// Función para llamar a la API de la NASA
function cargarFotografiaAstronomica() {
    const url = "https://science.nasa.gov/wp-json/wp/v2/posts";

    const cargadorElement = document.getElementById("cargador-imagen");
    const imagenElement = document.getElementById("imagen-apod");

    // Mostramos el cargador y ocultamos la imagen previa
    if (cargadorElement) cargadorElement.classList.remove("d-none");
    if (imagenElement) {
        imagenElement.classList.add("d-none");
        imagenElement.style.opacity = 0;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la petición: " + response.status);
            }
            return response.json();
        })
        .then(posts => {
            if (!posts || posts.length === 0) return;
            const post = posts[0];

            // Inserción de títulos y textos descriptivos
            document.getElementById("titulo-apod").innerHTML = post.title.rendered;
            document.getElementById("explicacion-apod").innerHTML = post.excerpt.rendered;

            const fecha = new Date(post.date);
            document.getElementById("fecha-publicacion").textContent = fecha.toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Asignación de imagen de la NASA
            if (post.featured_image_url && imagenElement) {
                imagenElement.src = post.featured_image_url;

                // Evento cuando la imagen ha terminado de cargar completamente
                imagenElement.onload = () => {
                    if (cargadorElement) cargadorElement.classList.add("d-none");
                    imagenElement.classList.remove("d-none");

                    // Animación suave de aparición con Anime.js
                    anime({
                        targets: imagenElement,
                        opacity: [0, 1],
                        scale: [1.05, 1],
                        duration: 900,
                        easing: 'easeOutQuad'
                    });

                    // Animación del texto complementario
                    anime({
                        targets: '#titulo-apod, #explicacion-apod',
                        translateX: [-15, 0],
                        opacity: [0, 1],
                        delay: anime.stagger(100),
                        duration: 600,
                        easing: 'easeOutQuad'
                    });
                };
            }

            // Manejo de enlaces y botones
            const enlaceVideo = document.getElementById("enlace-video");
            if (enlaceVideo) {
                enlaceVideo.href = post.link;
                enlaceVideo.textContent = "Ver artículo completo en NASA";
                enlaceVideo.removeAttribute("hidden");
            }

            const btnFavorito = document.getElementById("btn-favorito");
            if (btnFavorito) btnFavorito.removeAttribute("disabled");
        })
        .catch(error => {
            console.error("Hubo un problema al cargar los datos:", error);
            if (cargadorElement) cargadorElement.classList.add("d-none");
            document.getElementById("explicacion-apod").textContent = "No se pudo sincronizar la información astronómica en este momento. Inténtalo más tarde.";
        });
}

// Configuración del buscador por fecha
const formBusqueda = document.getElementById("form-busqueda");
const fechaApod = document.getElementById("fecha-apod");

if (fechaApod) {
    fechaApod.min = "1995-06-16";
    fechaApod.max = dayjs().format("YYYY-MM-DD");
}

if (formBusqueda) {
    formBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!fechaApod.value) {
            alert("Por favor selecciona una fecha para iniciar la búsqueda.");
            return;
        }

        if (dayjs(fechaApod.value).isAfter(dayjs(), "day")) {
            alert("La fecha seleccionada no puede ser posterior al día de hoy.");
            return;
        }

        if (dayjs(fechaApod.value).isBefore(dayjs('1995-06-16'), "day")) {
            alert("No existen registros astronómicos anteriores al 16 de junio de 1995.");
            return;
        }

        console.log("Fecha de búsqueda seleccionada:", fechaApod.value);
    });
}