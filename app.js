// Configuración de idioma de DayJS en español
dayjs.locale('es');

// Endpoints oficiales de la NASA (según la guía del proyecto)
const URL_APOD_HOY = "https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1";
const URL_APOD_FECHA = "https://science.nasa.gov/wp-json/wp/v2/apod-basic/";

// Variable global para almacenar la APOD que se está visualizando
let apodActual = null;

// ANIMACIONES DE INICIO Y CARGA CON ANIME.JS
document.addEventListener("DOMContentLoaded", () => {
    if (typeof anime !== "undefined" && document.querySelector('.spinner-orbital')) {
        anime({
            targets: '.spinner-orbital',
            rotate: '1turn',
            duration: 1200,
            easing: 'linear',
            loop: true
        });
    }

    if (typeof anime !== "undefined" && document.querySelectorAll('.tarjeta-cosmica').length > 0) {
        anime({
            targets: '.tarjeta-cosmica',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 800,
            easing: 'easeOutCubic'
        });
    }

    // Inicializar buscador, favoritos y cargar la foto del día
    configurarBuscador();
    mostrarFavoritos();
    cargarAPOD();
});

/**
 * Función principal para llamar a la API de la NASA y actualizar el HTML
 * @param {string|null} fechaFormatoYYYYMMDD - Fecha opcional en formato YYYY-MM-DD
 */
async function cargarAPOD(fechaFormatoYYYYMMDD = null) {
    let url = URL_APOD_HOY;

    if (fechaFormatoYYYYMMDD) {
        // La API de WordPress de la NASA requiere el formato YYMMDD (ej. 2024-03-15 -> 240315)[cite: 13, 15]
        const fechaYYMMDD = dayjs(fechaFormatoYYYYMMDD).format("YYMMDD");
        url = `${URL_APOD_FECHA}${fechaYYMMDD}`;
    }

    const cargadorElement = document.getElementById("cargador-imagen");
    const imagenElement = document.getElementById("imagen-apod");
    const enlaceVideo = document.getElementById("enlace-video");
    const explicacionElement = document.getElementById("explicacion-apod");
    const tituloElement = document.getElementById("titulo-apod");
    const fechaPubElement = document.getElementById("fecha-publicacion");

    if (cargadorElement) cargadorElement.classList.remove("d-none");
    if (imagenElement) imagenElement.classList.add("d-none");
    mostrarMensajeFavorito("");

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("No hay APOD registrada para esta fecha.");
            }
            throw new Error("Error en la petición: " + response.status);
        }

        const data = await response.json();
        
        // El endpoint ?per_page=1 devuelve un arreglo [0], por fecha específica devuelve un objeto directo[cite: 13]
        const post = Array.isArray(data) ? data[0] : data;

        if (!post) {
            throw new Error("No se encontraron registros astronómicos.");
        }

        apodActual = post;

        // Inserción de títulos y explicación científica
        if (tituloElement) tituloElement.textContent = post.title || "";
        if (explicacionElement) explicacionElement.innerHTML = post.explanation || "";

        if (fechaPubElement && post.date) {
            const fecha = dayjs(post.date);
            fechaPubElement.textContent = fecha.isValid() 
                ? fecha.format('D [de] MMMM [de] YYYY') 
                : post.date;
        }

        // Inserción de la imagen de la NASA al HTML (usando hdurl según la especificación de la API)[cite: 13]
        if (imagenElement) {
            imagenElement.src = post.hdurl || post.url || "";
            imagenElement.alt = post.title || "Fotografía astronómica del día";
            
            imagenElement.onload = () => {
                if (cargadorElement) cargadorElement.classList.add("d-none");
                imagenElement.classList.remove("d-none");

                if (typeof anime !== "undefined") {
                    anime({
                        targets: imagenElement,
                        opacity: [0, 1],
                        scale: [1.03, 1],
                        duration: 800,
                        easing: 'easeOutQuad'
                    });
                }
            };
        }

        // Manejo de videos de la NASA
        if (enlaceVideo) {
            if (post.media_type === "video" && post.permalink) {
                enlaceVideo.href = post.permalink;
                enlaceVideo.textContent = "Ver el video en NASA";
                enlaceVideo.classList.remove("d-none");
                enlaceVideo.removeAttribute("hidden");
            } else {
                enlaceVideo.classList.add("d-none");
                enlaceVideo.setAttribute("hidden", "true");
            }
        }

        // Habilitar botón de favoritos
        const btnFavorito = document.getElementById("btn-favorito");
        if (btnFavorito) btnFavorito.removeAttribute("disabled");

    } catch (error) {
        console.error("Hubo un problema al cargar los datos:", error);
        if (cargadorElement) cargadorElement.classList.add("d-none");
        if (explicacionElement) explicacionElement.textContent = error.message || "No se pudo cargar la información en este momento.";
        if (tituloElement) tituloElement.textContent = "Aviso del sistema";
    }
}

// Configuración del buscador por fecha y sus validaciones
function configurarBuscador() {
    const formBusqueda = document.getElementById("form-busqueda");
    const fechaApod = document.getElementById("fecha-apod");

    if (fechaApod) {
        fechaApod.min = "1995-06-16";
        fechaApod.max = dayjs().format("YYYY-MM-DD");
    }

    if (formBusqueda) {
        formBusqueda.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!fechaApod || !fechaApod.value) {
                alert("Parece que no seleccionaste una fecha. Valida por favor.");
                return;
            }

            if (dayjs(fechaApod.value).isAfter(dayjs(), "day") === true) {
                alert("Oh-uh, la fecha no es válida, por favor coloca una fecha anterior o igual a hoy.");
                return;
            }

            if (dayjs(fechaApod.value).isBefore(dayjs('1995-06-16'), "day") === true) {
                alert("Oh-uh. La fecha digitada no tiene registros. ");
                return;
            }

            console.log("El dato de fecha enviado es ", fechaApod.value);
            cargarAPOD(fechaApod.value);
        });
    }
}

// ==========================================
// MÓDULO DE FAVORITOS (LocalStorage)
// ==========================================
const CLAVE_FAVORITOS = "favoritosApod";

function obtenerFavoritos() {
  const guardado = localStorage.getItem(CLAVE_FAVORITOS);

  if (guardado === null) {
    return [];
  }

  try {
    return JSON.parse(guardado);
  } catch (error) {
    console.error("Favoritos dañados en localStorage:", error);
    return [];
  }
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}

function mostrarMensajeFavorito(texto) {
  const mensajeEl = document.getElementById("mensaje");
  if (mensajeEl) mensajeEl.textContent = texto;
}

function yaEsFavorito(favoritos, fecha) {
  return favoritos.some(favorito => favorito.date === fecha);
}

function agregarFavorito() {
  if (!apodActual) {
    mostrarMensajeFavorito("Todavía no hay una fotografía cargada para guardar.");
    return;
  }

  const favoritos = obtenerFavoritos();

  if (yaEsFavorito(favoritos, apodActual.date)) {
    mostrarMensajeFavorito("Esta fotografía ya está en tus favoritos.");
    return;
  }

  favoritos.push({
    date: apodActual.date,
    title: apodActual.title
  });

  guardarFavoritos(favoritos);
  mostrarFavoritos();
  mostrarMensajeFavorito("¡Fotografía guardada en favoritos!");
}

function crearItemFavorito(favorito) {
  const item = document.createElement("li");
  item.className = "list-group-item bg-transparent border-secondary text-light mb-2 rounded p-2";
  
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn btn-link text-start text-light text-decoration-none p-0 w-100 text-truncate";
  boton.textContent = dayjs(favorito.date).format("D [de] MMMM [de] YYYY") + " — " + favorito.title;

  boton.addEventListener("click", () => {
    cargarAPOD(favorito.date);
    const seccionFoto = document.getElementById("fotografia");
    if (seccionFoto) {
      seccionFoto.scrollIntoView({ behavior: "smooth" });
    }
  });

  item.appendChild(boton);
  return item;
}

function mostrarFavoritos() {
  const lista = document.getElementById("lista-favoritos");
  const mensajeVacio = document.getElementById("mensaje-favoritos");
  
  if (!lista || !mensajeVacio) return;

  const favoritos = obtenerFavoritos();

  lista.innerHTML = "";

  mensajeVacio.hidden = favoritos.length > 0;
  lista.classList.toggle("d-none", favoritos.length === 0);

  favoritos.forEach(favorito => {
    lista.appendChild(crearItemFavorito(favorito));
  });
}

// Event Listeners para favoritos
const btnFavoritoEl = document.getElementById("btn-favorito");
if (btnFavoritoEl) {
  btnFavoritoEl.addEventListener("click", agregarFavorito);
}