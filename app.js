// Configuración de idioma de DayJS
dayjs.locale('es');

const URL_APOD = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
const PRIMERA_APOD = "1995-06-16";

// La APOD que se está mostrando (la usa favoritos.js para saber cuál guardar)
let apodActual = null;

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

    // Al abrir la página se carga la APOD de hoy
    cargarAPOD();
});

// ---------- Mensajes en pantalla ----------

function mostrarMensaje(texto) {
    document.getElementById("mensaje").textContent = texto;
}

// ---------- Pedir la APOD a la API ----------

function construirUrl(fecha) {
    if (!fecha) {
        return URL_APOD + "?per_page=1"; // la de hoy
    }
    // La API pide AAMMDD: "2024-03-15" -> "240315"
    return URL_APOD + "/" + dayjs(fecha).format("YYMMDD");
}

// Sirve para hoy (sin argumento), para el buscador y para los favoritos ("AAAA-MM-DD")
async function cargarAPOD(fecha) {
    mostrarMensaje("Cargando…");

    try {
        const respuesta = await fetch(construirUrl(fecha));

        // fetch no lanza error con un 404: hay que revisarlo a mano
        if (!respuesta.ok) {
            throw new Error("No hay APOD para esa fecha");
        }

        const datos = await respuesta.json();

        // Hoy responde un arreglo; una fecha responde un objeto
        const apod = Array.isArray(datos) ? datos[0] : datos;

        mostrarAPOD(apod);
        mostrarMensaje("");
    } catch (error) {
        console.error("Hubo un problema al cargar los datos:", error);
        mostrarMensaje(error.message);

        // Si todavía no había nada en pantalla, quitamos el spinner y avisamos ahí también
        if (!apodActual) {
            document.getElementById("cargador-imagen").classList.add("d-none");
            document.getElementById("explicacion-apod").textContent = error.message;
        }
    }
}

// ---------- Pintar la APOD en la página ----------

function mostrarAPOD(apod) {
    apodActual = { date: apod.date, title: apod.title };

    document.getElementById("titulo-apod").textContent = apod.title;
    document.getElementById("fecha-publicacion").textContent =
        dayjs(apod.date).format("D [de] MMMM [de] YYYY");

    // explanation trae HTML (negritas y enlaces), por eso innerHTML
    document.getElementById("explicacion-apod").innerHTML = apod.explanation;

    mostrarImagen(apod.hdurl, apod.title);

    // El enlace solo se ve cuando es un video
    const enlaceVideo = document.getElementById("enlace-video");
    enlaceVideo.href = apod.permalink;
    enlaceVideo.hidden = apod.media_type !== "video";

    // Ya hay algo que guardar
    document.getElementById("btn-favorito").disabled = false;
}

function mostrarImagen(urlImagen, titulo) {
    const cargador = document.getElementById("cargador-imagen");
    const imagen = document.getElementById("imagen-apod");

    imagen.alt = titulo;

    // Cuando la imagen ya está lista: ocultar spinner y animar con Anime.js
    const revelar = () => {
        cargador.classList.add("d-none");
        imagen.classList.remove("d-none");

        anime({
            targets: imagen,
            opacity: [0, 1],
            scale: [1.05, 1],
            duration: 900,
            easing: 'easeOutQuad'
        });

        anime({
            targets: '#titulo-apod, #explicacion-apod',
            translateX: [-15, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutQuad'
        });
    };

    if (!urlImagen) {
        cargador.classList.add("d-none");
        mostrarMensaje("Esta publicación no trae imagen.");
        return;
    }

    // Si es la misma imagen que ya se ve, el navegador no dispara "load" otra vez
    if (imagen.getAttribute("src") === urlImagen) {
        revelar();
        return;
    }

    cargador.classList.remove("d-none");
    imagen.classList.add("d-none");
    imagen.style.opacity = 0;

    imagen.onload = revelar;
    imagen.onerror = () => {
        cargador.classList.add("d-none");
        mostrarMensaje("No se pudo cargar la imagen.");
    };
    imagen.src = urlImagen;
}

// ---------- Buscador por fecha ----------

const formBusqueda = document.getElementById("form-busqueda");
const fechaApod = document.getElementById("fecha-apod");

if (fechaApod) {
    fechaApod.min = PRIMERA_APOD;
    fechaApod.max = dayjs().format("YYYY-MM-DD");
}

if (formBusqueda) {
    formBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!fechaApod.value) {
            mostrarMensaje("Por favor selecciona una fecha para iniciar la búsqueda.");
            return;
        }

        if (dayjs(fechaApod.value).isAfter(dayjs(), "day")) {
            mostrarMensaje("La fecha seleccionada no puede ser posterior al día de hoy.");
            return;
        }

        if (dayjs(fechaApod.value).isBefore(dayjs(PRIMERA_APOD), "day")) {
            mostrarMensaje("No existen registros astronómicos anteriores al 16 de junio de 1995.");
            return;
        }

        cargarAPOD(fechaApod.value);
    });
}