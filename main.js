let nombre;
let edad;
let transacciones = [];

const tipo = document.getElementById("tipo");
const descripcion = document.getElementById("descripcion");
const monto = document.getElementById("monto");
const agregarBtn = document.getElementById("agregar");
const lista = document.getElementById("lista-movimientos");
const saldoTotal = document.getElementById("saldo-total");

//Clase para agrupar transacciones
class Transaccion {
  constructor(tipo, monto , descripcion) {
    if (tipo == "1") {
      this.tipo = "Ingreso";
    } else {
      this.tipo = "Egreso";
    }
    this.descripcion = descripcion;
    this.monto = monto;
    this.uuid = crypto.randomUUID();
  }

  getDescription() {
    return this.descripcion;
  }

  getInternalReference() {
    return this.uuid;
  }

  getTipo() {
    return this.tipo;
  }

  getMonto() {
    return this.monto;
  }
}

function registrarMovimiento() {
  const tipo = document.getElementById("tipo").value;
  const descripcion = document.getElementById("descripcion").value;
  const monto = parseFloat(document.getElementById("monto").value);

  if (!descripcion || isNaN(monto)) {
    alert("Por favor completá todos los campos");
    return;
  }
  const newTransaction = new Transaccion(tipo, monto,descripcion)

  console.log("Nueva Transaccion: Descripcion:" + newTransaction.getDescription() + 
              "\nTipo: " + newTransaction.getTipo() + 
              "\nMonto: " + newTransaction.getMonto())

  transacciones.push(newTransaction);
  actualizarVistaDeMovimientos();
}

function eliminarMovimiento(internalReference)
{
  const transaccionAEliminar = transacciones.find(
    (mov) => mov.getInternalReference() === internalReference
  );

  console.log("transaccion a borrar:\n" + "Monto: " + transaccionAEliminar.getMonto() + 
  "\nUUID: "+ transaccionAEliminar.getInternalReference() +
  "\nTipo: "+ transaccionAEliminar.getTipo() +
  "\nDescripcion: "+ transaccionAEliminar.getDescription());

  const index = transacciones.findIndex(
  (mov) => mov.getInternalReference() === internalReference
  );
  if (index !== -1) {
    transacciones.splice(index, 1);
  }
  console.log("index de la transaccion a borrar:" + index);

  actualizarVistaDeMovimientos();
}

function actualizarVistaDeMovimientos() {
  const lista = document.getElementById("lista-movimientos");
  lista.innerHTML = "";
  let saldo = 0;

  transacciones.forEach((mov) => {     
    const item = document.createElement("li");
    item.className =
    "list-group-item bg-transparent d-flex justify-content-between align-items-center";

    const texto = document.createElement("span");
    texto.textContent = `${mov.getDescription()} - $${mov.getMonto().toFixed(2)} (${mov.getTipo()})`;

    if(mov.getTipo() === "Ingreso") {
      texto.classList.add("transaction-in")
       saldo += mov.monto;
    } else {
      texto.classList.add("transaction-out")
      saldo -= mov.monto;
    }

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn btn-sm btn-outline-danger ms-2";
    btnEliminar.innerHTML = '<i class="bi bi-trash"></i>';
    btnEliminar.onclick = () => {
      const respuesta = confirm("Esta seguro que desea eliminar esta transacción?")
      if(respuesta){
        eliminarMovimiento(mov.getInternalReference())
      }
    };

    item.appendChild(texto);
    item.appendChild(btnEliminar);
    lista.appendChild(item);
  });

  document.getElementById("saldo-total").textContent = "Saldo Total: "+ saldo.toFixed(2);
}

//Eliminar transaccion por indice de orden
function eliminarTransaccionPorIndice() {
  if (transacciones.length === 0) {
    alert("No hay transacciones para eliminar.");
    return;
  }

  verTransacciones();

  let indice = parseInt(
    prompt(`Ingresá el número de índice de la transacción que querés eliminar:`)
  );

  if (isNaN(indice) || indice <= 0 || indice >= transacciones.length + 1) {
    alert("Índice inválido. No se realizó ninguna eliminación.");
    return;
  }

  let transaccionSeleccionada = transacciones[indice - 1];

  let confirmar = confirm(
    `¿Estás seguro de que querés eliminar la transacción "${transaccionSeleccionada.getTipo()}" por $${transaccionSeleccionada.getMonto()}?`
  );

  if (confirmar) {
    transacciones.splice(indice - 1, 1);
    alert("Transacción eliminada correctamente.");
  } else {
    alert("Eliminación cancelada.");
  }

  verTransacciones();
}

//Mostrar las transacciones en alert
function verTransacciones() {
  if (transacciones.length === 0) {
    alert("No hay transacciones registradas.");
    return;
  }

  let resumen = "Listado de transacciones:\n";
  let i = 1;
  for (let t of transacciones) {
    resumen = resumen + `${i}. ${t.getTipo()}: $${t.getMonto()}\n`;
    i = i + 1;
  }

  alert(resumen);
}

//Eliminar transaccion de la lista
function eliminarUltimaTransaccion() {
  if (transacciones.length === 0) {
    alert("No hay transacciones para eliminar.");
    return;
  }

  let ultima = transacciones.pop();
  alert(
    `Se eliminó la última transacción: ${ultima.getTipo()} de $${ultima.getMonto()}`
  );
}

//Filtrar y mostrar las transacciones por tipo
function filtrarPorTipo(tipoBuscado) {
  let filtradas = transacciones.filter((t) => t.getTipo() === tipoBuscado);

  if (filtradas.length === 0) {
    alert(`No hay transacciones del tipo: ${tipoBuscado}`);
    return;
  }

  let resumen = `Transacciones de tipo ${tipoBuscado}:\n`;
  let i = 1;
  for (let t of filtradas) {
    resumen = resumen + `${i}. $${t.getMonto()}\n`;
    i++;
  }

  alert(resumen);
}

//Ingresar transacciones de ingreso/egreso
function crearTransacciones() {
  let continuar = true;

  while (continuar) {
    let tipo = prompt(
      "¿Qué tipo de transacción querés hacer?\n" + "1. Ingreso\n" + "2. Egreso"
    );

    if (tipo !== "1" && tipo !== "2") {
      alert("Opción inválida. Ingresá 1 para ingreso o 2 para egreso.");
      continue;
    }

    let monto = parseFloat(prompt("Ingresá el monto de la transacción:"));

    if (isNaN(monto) || monto <= 0) {
      alert("El monto ingresado no es válido.");
      continue;
    }
    let transaccionActual = new Transaccion(tipo, monto);

    transacciones.push(transaccionActual);

    continuar = confirm("¿Querés ingresar otra transacción?");
  }
}

//Funcion para sumar ingresos egresos y calcular el balance
function calcularBalance() {
  let resumen = `Resumen de transacciones de ${nombre}:\n`;
  let totalIngresos = 0;
  let totalEgresos = 0;

  for (let t of transacciones) {
    let tipoRecorrer = t.getTipo();
    let montoRecorrer = t.getMonto();
    resumen = resumen + `- ${tipoRecorrer}: $${montoRecorrer}\n`;
    if (tipoRecorrer === "Ingreso") {
      totalIngresos = totalIngresos + montoRecorrer;
    } else {
      totalEgresos = totalEgresos + montoRecorrer;
    }
  }

  resumen = resumen + `\n`;
  resumen = resumen + `Total Ingresos: $${totalIngresos}\n`;
  resumen = resumen + `Total Egresos: $${totalEgresos}\n\n`;
  resumen = resumen + `Balance: $${totalIngresos - totalEgresos}`;

  alert(resumen);
}

//Función de main menu para entrar a las distintas opciones
function mainMenu() {
  let option;
  let leaveMenu = false;

  do {
    leaveMenu = true;
    let input = prompt(
      "Selecciona la opción a utilizar\n" +
        "     1. Ingresar Movimientos Mensuales\n" +
        "     2. Ver las transacciones del mes\n" +
        "     3. Calcular balance mensual\n" +
        "     4. Eliminar ultima transaccion\n" +
        "     5. Mostrar Ingresos\n" +
        "     6. Mostrar Egresos\n" +
        "     7. Eliminar Movimiento\n\n" +
        "     8. Salir\n"
    );

    option = parseInt(input);

    if (isNaN(option)) {
      alert("Debes ingresar un número.");
      isValidOption = false;
      continue; // vuelve a mostrar el menú
    }

    switch (option) {
      case 1:
        crearTransacciones();
        break;
      case 2:
        verTransacciones();
        break;
      case 3:
        calcularBalance();
        break;
      case 4:
        eliminarUltimaTransaccion();
        break;
      case 5:
        filtrarPorTipo("Ingreso");
        break;
      case 6:
        filtrarPorTipo("Egreso");
        break;
      case 7:
        eliminarTransaccionPorIndice();
        break;
      case 8:
        leaveMenu = false;
        break;
      default:
        alert("Opción no válida. Elegí un número del 1 al 8.");
    }
  } while (leaveMenu === true);
}

//Funcion para hacer el login del usuario, verifica un nombre y edad
function loginUsuario() {
  console.log("Bienvenido al simulador de finanzas personales");
  let inputNombreIsValid;
  let edadValid;
  do {
    do {
      inputNombreIsValid = true;
      nombre = prompt(
        "Hola, bienvenido al simulador de finanzas personales\n" +
          "¿Cuál es tu nombre?"
      );
      if (!/^[a-zA-Z]+$/.test(nombre)) {
        inputNombreIsValid = false;
        alert("Su nombre no debe contener espacios, simbolos o números");
      }
    } while (inputNombreIsValid === false);
    console.log("Hola " + nombre + " bienvenido al simulador");

    do {
      edadValid = true;
      edad = parseInt(prompt("¿Cuántos años tienes?"));
      if (isNaN(edad)) {
        edadValid = false;
        alert("La edad debe ser un numero");
      } else {
        console.log("La edad ingresada es: " + edad);
      }
    } while (edadValid === false);
    if (edad < 18) {
      alert("Debes ser mayor de 18 años para ingresar a la plataforma");
    }
  } while (edad < 18);
  alert(`Hola ${nombre}, bienvenido a la plataforma!`);
}

function main() {
/*   loginUsuario();
  console.log(`Usuario ${nombre} de ${edad} años, bienvenido a la plataforma!`);
  mainMenu(); 
*/  
}

main();
