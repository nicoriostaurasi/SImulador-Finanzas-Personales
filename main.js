let nombre;
let edad;

let transactionsList = [];
const type = document.getElementById("type");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const lista = document.getElementById("movements-list");

//Clase para agrupar transactionsList
class Transaction {
  constructor(type, amount , description) {
    if (type == "1") {
      this.type = "Ingreso";
    } else {
      this.type = "Egreso";
    }
    this.description = description;
    this.amount = amount;
    this.uuid = crypto.randomUUID();
  }

  getDescription() {
    return this.description;
  }

  getInternalReference() {
    return this.uuid;
  }

  getType() {
    return this.type;
  }

  getAmount() {
    return this.amount;
  }
}

function storeTransactionsInLocalStorage() {
  localStorage.setItem("transactionsList", JSON.stringify(transactionsList));
}

function registerNewMovement() {
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!description || isNaN(amount)) {
    alert("Por favor completá todos los campos");
    return;
  }
  const newTransaction = new Transaction(type, amount,description)

  console.log("Nueva Transaction: Descripcion:" + newTransaction.getDescription() + 
              "\nTipo: " + newTransaction.getType() + 
              "\nMonto: " + newTransaction.getAmount())

  transactionsList.push(newTransaction);
  renderMovementsView();
  storeTransactionsInLocalStorage();
}

function deleteMovement(internalReference)
{
  const transactionToDelete = transactionsList.find(
    (mov) => mov.getInternalReference() === internalReference
  );

  console.log("transaccion a borrar:\n" + "Monto: " + transactionToDelete.getAmount() + 
  "\nUUID: "+ transactionToDelete.getInternalReference() +
  "\nTipo: "+ transactionToDelete.getType() +
  "\nDescripcion: "+ transactionToDelete.getDescription());

  const index = transactionsList.findIndex(
  (mov) => mov.getInternalReference() === internalReference
  );
  if (index !== -1) {
    transactionsList.splice(index, 1);
  }
  console.log("index de la transaccion a borrar:" + index);
  storeTransactionsInLocalStorage();
  renderMovementsView();
}

function renderMovementsView() {
  const lista = document.getElementById("movements-list");
  lista.innerHTML = "";
  let balance = 0;

  transactionsList.forEach((mov) => {     
    const item = document.createElement("li");
    item.className =
    "list-group-item bg-transparent d-flex justify-content-between align-items-center";

    const text = document.createElement("span");
    text.textContent = `${mov.getDescription()} - $${mov.getAmount().toFixed(2)} (${mov.getType()})`;

    if(mov.getType() === "Ingreso") {
      text.classList.add("transaction-in")
       balance += mov.getAmount();
    } else {
      text.classList.add("transaction-out")
      balance -= mov.getAmount();
    }

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn btn-sm btn-outline-danger ms-2";
    btnDelete.innerHTML = '<i class="bi bi-trash"></i>';
    btnDelete.onclick = () => {
      const answerOnConfirmDelete = confirm("Esta seguro que desea eliminar esta transacción?")
      if(answerOnConfirmDelete){
        deleteMovement(mov.getInternalReference())
      }
    };

    item.appendChild(text);
    item.appendChild(btnDelete);
    lista.appendChild(item);
  });

  document.getElementById("total-balance").textContent = "Saldo Total: "+ balance.toFixed(2);
}

function getListOfTransactions(){
  const storedTransactions = localStorage.getItem("transactionsList");

  if (storedTransactions) {
    const datos = JSON.parse(storedTransactions);
    transactionsList = datos.map((t) => {
      const transaction = new Transaction(t.type === "Ingreso" ? "1" : "2", t.amount, t.description);
      transaction.uuid = t.uuid;
      return transaction;
    });
    renderMovementsView();
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
  getListOfTransactions();
}

main();
