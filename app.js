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