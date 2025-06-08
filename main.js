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

function guardarTransaccionesEnStorage() {
  localStorage.setItem("transacciones", JSON.stringify(transacciones));
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
  guardarTransaccionesEnStorage();
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
  guardarTransaccionesEnStorage();
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

function obtenerListaDeTransacciones(){
  const transaccionesGuardadas = localStorage.getItem("transacciones");

  if (transaccionesGuardadas) {
    const datos = JSON.parse(transaccionesGuardadas);
    transacciones = datos.map((t) => {
      const transaccion = new Transaccion(t.tipo === "Ingreso" ? "1" : "2", t.monto, t.descripcion);
      transaccion.uuid = t.uuid;
      return transaccion;
    });
    actualizarVistaDeMovimientos();
  }
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
  obtenerListaDeTransacciones();
}

main();
