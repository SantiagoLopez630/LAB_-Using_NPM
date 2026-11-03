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
  