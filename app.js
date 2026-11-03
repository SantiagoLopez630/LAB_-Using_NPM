// Creacion de function para llamar a API de la Nasa y html
function cargarFotografiaAstronomica() {
    const url = "https://science.nasa.gov/wp-json/wp/v2/posts";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la petición: " + response.status);
            }
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) return;
            const post = posts[0];


            // Para el título y la explicación o descripción de la NASA
            document.getElementById("titulo-apod").innerHTML = post.title.rendered;
            document.getElementById("explicacion-apod").innerHTML = post.excerpt.rendered;

            const fecha = new Date(post.date);
            document.getElementById("fecha-publicacion").textContent = fecha.toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Inserción de la imagen de la nasa al HTML
            const imagenElement = document.getElementById("imagen-apod");
            if (post.featured_image_url) {
                imagenElement.src = post.featured_image_url;
                imagenElement.removeAttribute("hidden");
            }

            // Para cuando la NASA tenga un video
            const enlaceVideo = document.getElementById("enlace-video");
            enlaceVideo.href = post.link;
            enlaceVideo.textContent = "Ver artículo completo en NASA";
            enlaceVideo.removeAttribute("hidden");

            // Botón de favoritos
            document.getElementById("btn-favorito").removeAttribute("disabled");
        })
        .catch(error => {
            console.error("Hubo un problema al cargar los datos:", error);
            document.getElementById("explicacion-apod").textContent = "No se pudo cargar la información en este momento.";
        });
}

document.addEventListener("DOMContentLoaded", cargarFotografiaAstronomica);  

// * Se definen constantes
const formBusqueda = document.getElementById("form-busqueda");
const fechaApod = document.getElementById("fecha-apod");

// * Se definen minimos y máximos para el input de fecha
fechaApod.min = "1995-06-16";
fechaApod.max = dayjs().format("YYYY-MM-DD");

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

    // * Si fecha es menor a '1995-06-16' alerta y retorna vacio
    if (dayjs(fechaApod.value).isBefore(dayjs('1995-06-16'), "day") === true) {

        alert("Oh-uh. La fecha digitada no tiene registros. ");
        return;
    }

    // ! Log de prueba - Borrar antes de entrega
    console.log("El dato de fecha enviado es ", fechaApod.value);
    
});