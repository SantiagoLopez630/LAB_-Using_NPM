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

    // Inicializar buscador y favoritos
    configurarBuscador();
    mostrarFavoritos();
    cargarFotografiaAstronomica();
});

// Creacion de function para llamar a API de la Nasa y html
async function cargarFotografiaAstronomica(fechaFormatoYYYYMMDD = null) {
    let url = URL_APOD_HOY;

    if (fechaFormatoYYYYMMDD) {
       
        const fechaYYMMDD = dayjs(fechaFormatoYYYYMMDD).format("YYMMDD");
        url = `${URL_APOD_FECHA}${fechaYYMMDD}`;
    }

    const cargadorElement = document.getElementById("cargador-imagen");
    const imagenElement = document.getElementById("imagen-apod");

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
        
       
        const post = Array.isArray(data) ? data[0] : data;

        if (!post) {
            throw new Error("No se encontraron registros astronómicos.");
        }

        apodActual = post;

        // Para el título y la explicación o descripción de la NASA
        document.getElementById("titulo-apod").innerHTML = post.title;
        document.getElementById("explicacion-apod").innerHTML = post.explanation;

        const fecha = new Date(post.date);
        document.getElementById("fecha-publicacion").textContent = fecha.toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Inserción de la imagen de la nasa al HTML
        if (imagenElement) {
            imagenElement.src = post.hdurl || post.url;
            imagenElement.alt = post.title || "Fotografía astronómica del día";
            
            imagenElement.onload = () => {
                if (cargadorElement) cargadorElement.classList.add("d-none");
                imagenElement.removeAttribute("hidden");
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

        // Para cuando la NASA tenga un video
        const enlaceVideo = document.getElementById("enlace-video");
        if (enlaceVideo) {
            if (post.media_type === "video" && post.permalink) {
                enlaceVideo.href = post.permalink;
                enlaceVideo.textContent = "Ver artículo completo en NASA";
                enlaceVideo.classList.remove("d-none");
                enlaceVideo.removeAttribute("hidden");
            } else {
                enlaceVideo.classList.add("d-none");
                enlaceVideo.setAttribute("hidden", "true");
            }
        }

        // Botón de favoritos
        document.getElementById("btn-favorito").removeAttribute("disabled");

    } catch (error) {
        console.error("Hubo un problema al cargar los datos:", error);
        if (cargadorElement) cargadorElement.classList.add("d-none");
        document.getElementById("explicacion-apod").textContent = error.message || "No se pudo cargar la información en este momento.";
    }
}

// * Se definen constantes para el buscador
const formBusqueda = document.getElementById("form-busqueda");
const fechaApod = document.getElementById("fecha-apod");

function configurarBuscador() {
    if (fechaApod) {
        // * Se definen minimos y máximos para el input de fecha
        fechaApod.min = "1995-06-16";
        fechaApod.max = dayjs().format("YYYY-MM-DD");
    }

    if (formBusqueda) {
        // * Se reciben datos desde el boton submit
        formBusqueda.addEventListener("submit", (e) => {
            // * Por prevención xd
            e.preventDefault();

            // * Si fecha llega vacio alerta y retorna vacio
            if (!fechaApod.value) {
                alert("Parece que no seleccionaste una fecha. Valida por favor.");
                return;
            }

            // * Si fecha es mayor a la actual alerta y retorna vacio
            if (dayjs(fechaApod.value).isAfter(dayjs(), "day") === true) {
                alert("Oh-uh, la fecha no es válida, por favor coloca una fecha anterior o igual a hoy.");
                return;
            }

            // * Si fecha es menor al '1995-06-16' alerta y retorna vacio
            if (dayjs(fechaApod.value).isBefore(dayjs('1995-06-16'), "day") === true) {
                alert("Oh-uh. La fecha digitada no tiene registros. ");
                return;
            }

            // ! Log de prueba - Borrar antes de entrega
            console.log("El dato de fecha enviado es ", fechaApod.value);

            // Llamar a cargar la foto de la fecha específica
            cargarFotografiaAstronomica(fechaApod.value);
        });
    }
}

// ==========================================
// MÓDULO DE FAVORITOS 
// ==========================================
const CLAVE_FAVORITOS = "favoritosApod";

function obtenerFavoritos() {
  const guardado = localStorage.getItem(CLAVE_FAVORITOS);

  // Si todavía no hay nada guardado, getItem devuelve null -> arreglo vacío
  if (guardado === null) {
    return [];
  }

  try {
    return JSON.parse(guardado);
  } catch (error) {
    // Si el texto guardado estuviera dañado, empezamos de cero sin romper la página
    console.error("Favoritos dañados en localStorage:", error);
    return [];
  }
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}

function mostrarMensajeFavorito(texto) {
  const mensajeEl = document.getElementById("mensaje");
  if (mensajeEl) {
    mensajeEl.textContent = texto;
  }
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
  mostrarMensajeFavorito("Fotografía guardada en favoritos");
}

function crearItemFavorito(favorito) {
  const item = document.createElement("li");
  const boton = document.createElement("button");

  boton.type = "button";
  boton.className = "btn btn-link text-start text-light text-decoration-none p-0 w-100 text-truncate";
  boton.textContent =
    dayjs(favorito.date).format("D [de] MMMM [de] YYYY") + " — " + favorito.title;

  boton.addEventListener("click", () => {
    cargarFotografiaAstronomica(favorito.date);
    const seccionFotografia = document.getElementById("fotografia");
    if (seccionFotografia) {
      seccionFotografia.scrollIntoView({ behavior: "smooth" });
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

const btnFavoritoEl = document.getElementById("btn-favorito");
if (btnFavoritoEl) {
  btnFavoritoEl.addEventListener("click", agregarFavorito);
}