
const CLAVE_FAVORITOS = "favoritosApod";

// ---------- Leer y guardar en localStorage ----------

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

// ---------- Utilidades ----------

function mostrarMensajeFavorito(texto) {
  document.getElementById("mensaje").textContent = texto;
}

function yaEsFavorito(favoritos, fecha) {
  return favoritos.some(favorito => favorito.date === fecha);
}

// ---------- Agregar un favorito ----------

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
  boton.textContent =
    dayjs(favorito.date).format("D [de] MMMM [de] YYYY") + " — " + favorito.title;

  boton.addEventListener("click", () => cargarAPOD(favorito.date));

  item.appendChild(boton);
  return item;
}

function mostrarFavoritos() {
  const lista = document.getElementById("lista-favoritos");
  const mensajeVacio = document.getElementById("mensaje-favoritos");
  const favoritos = obtenerFavoritos();

  lista.innerHTML = "";

  mensajeVacio.hidden = favoritos.length > 0;

  favoritos.forEach(favorito => {
    lista.appendChild(crearItemFavorito(favorito));
  });
}


document.getElementById("btn-favorito").addEventListener("click", agregarFavorito);
document.addEventListener("DOMContentLoaded", mostrarFavoritos);
