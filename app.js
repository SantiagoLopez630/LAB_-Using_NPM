const formBusqueda = document.getElementById("form-busqueda");
const fechaApod = document.getElementById("fecha-apod");

formBusqueda.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!fechaApod.value){
        
        alert("Parece que no seleccionaste una fecha. Valida por favor.");
        return;
    }

    if (dayjs(fechaApod).isAfter(dayjs(), "day") === true) {

        alert("Oh-uh, la fecha no es válida, por favor coloca una fecha posterior a hoy.");
        return;
    }

    console.log("Fecha de algo de validacion pero funcionó super bien jaja:", dayjs(fechaApod).isAfter(dayjs(), "day"));
    console.log("Formulario enviado:", formBusqueda);
    console.log("El dato de fecha enviado es ", fechaApod.value);
    console.log("Day.js disponible:", dayjs());

});