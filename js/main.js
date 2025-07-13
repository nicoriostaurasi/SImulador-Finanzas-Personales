let transactionsList = [];
const type = document.getElementById("type");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const lista = document.getElementById("movements-list");
let currentUser;
const darkSwal = Swal.mixin({
  background: "#1e1e2f",
  color: "#ffffff",
  confirmButtonColor: "#4caf50",
  cancelButtonColor: "#d33",
  customClass: {
    popup: "rounded-3 shadow",
    title: "fs-4",
    confirmButton: "btn btn-primary",
    cancelButton: "btn btn-secondary",
  },
  buttonsStyling: false,
});

//Clase para agrupar transactionsList
class Transaction {
  constructor(type, amount, description, user) {
    if (type == "1") {
      this.type = "Ingreso";
    } else {
      this.type = "Egreso";
    }
    this.description = description;
    this.amount = amount;
    this.user = user;
    this.uuid = crypto.randomUUID();
  }

  getUser() {
    return this.user;
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
  const stored = localStorage.getItem("transactionsList");
  let existingTransactions = stored ? JSON.parse(stored) : [];

  const nuevos = transactionsList.filter((nuevo) => {
    return !existingTransactions.some(
      (existente) => existente.uuid === nuevo.uuid
    );
  });

  const actualizadas = existingTransactions.concat(nuevos);

  localStorage.setItem("transactionsList", JSON.stringify(actualizadas));
}

function deleteTransactionInLocalByUUID(uuid) {
  const stored = localStorage.getItem("transactionsList");
  if (!stored) return;

  const transactions = JSON.parse(stored);

  // Filtrar quitando la transacción con el UUID indicado
  const updatedTransactions = transactions.filter((tx) => tx.uuid !== uuid);

  // Guardar la lista actualizada en localStorage
  localStorage.setItem("transactionsList", JSON.stringify(updatedTransactions));
}

function registerNewMovement() {
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!description || isNaN(amount)) {
    darkSwal.fire(
      "Campos incompletos",
      "Por favor completá todos los campos",
      "warning"
    );
    return;
  }

  if (amount <= 0) {
    darkSwal.fire(
      "Monto incorrecto",
      "El monto ingresado de la transacción " +
        description +
        " debe ser mayor a 0",
      "warning"
    );
    return;
  }

  const newTransaction = new Transaction(
    type,
    amount,
    description,
    currentUser
  );

  console.log(
    "Nueva Transaction: Descripcion:" +
      newTransaction.getDescription() +
      "\nTipo: " +
      newTransaction.getType() +
      "\nMonto: " +
      newTransaction.getAmount()
  );

  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";

  transactionsList.push(newTransaction);
  renderMovementsView();
  storeTransactionsInLocalStorage();
}

function deleteMovement(internalReference) {
  const transactionToDelete = transactionsList.find(
    (mov) => mov.getInternalReference() === internalReference
  );

  console.log(
    "transaccion a borrar:\n" +
      "Monto: " +
      transactionToDelete.getAmount() +
      "\nUUID: " +
      transactionToDelete.getInternalReference() +
      "\nTipo: " +
      transactionToDelete.getType() +
      "\nDescripcion: " +
      transactionToDelete.getDescription()
  );

  const index = transactionsList.findIndex(
    (mov) => mov.getInternalReference() === internalReference
  );
  if (index !== -1) {
    transactionsList.splice(index, 1);
  }
  console.log("index de la transaccion a borrar:" + index);
  deleteTransactionInLocalByUUID(internalReference);
  renderMovementsView();
}

function processBalance(transactions) {
  // Calcula el balance acumulando ingresos y egresos
  return transactions.reduce((acc, mov) => {
    if (mov.getType() === "Ingreso") {
      return acc + mov.getAmount();
    } else {
      return acc - mov.getAmount();
    }
  }, 0);
}

function renderMovementsView() {
  const lista = document.getElementById("movements-list");
  lista.innerHTML = "";

  const balance = transactionsList.reduce((acc, mov) => {
    return mov.getType() === "Ingreso"
      ? acc + mov.getAmount()
      : acc - mov.getAmount();
  }, 0);

  transactionsList.forEach((mov) => {
    const formattedAmount = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(mov.getAmount());

    const item = document.createElement("li");
    item.className =
      "list-group-item bg-transparent d-flex justify-content-between align-items-center";

    item.innerHTML = `
      <span class="${
        mov.getType() === "Ingreso" ? "transaction-in" : "transaction-out"
      }">
        ${mov.getDescription()} - ${formattedAmount} $ (${mov.getType()})
      </span>
      <button class="btn btn-sm btn-outline-danger ms-2">
        <i class="bi bi-trash"></i>
      </button>
    `;

    const btnDelete = item.querySelector("button");
    btnDelete.addEventListener("click", () => {
      darkSwal
        .fire({
          title: "¿Está seguro?",
          text: "Esta transacción se eliminará permanentemente.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        })
        .then((result) => {
          if (result.isConfirmed) {
            deleteMovement(mov.getInternalReference());
          }
        });
    });

    lista.appendChild(item);
  });

  const formattedBalance = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  document.getElementById("total-balance").textContent =
    "Saldo Total: " + formattedBalance + " $";
}

function displayTransactions() {
  console.log("en memoria actual");
  displayTransactionStored();
  console.log("Guardadas");
  displayTransactionLocal();
}

function displayTransactionLocal() {
  transactionsList.forEach((mov) => {
    console.log(
      "Transaccion:" +
        "Monto: " +
        mov.getAmount() +
        "\nUUID: " +
        mov.getInternalReference() +
        "\nTipo: " +
        mov.getType() +
        "\nDescripcion: " +
        mov.getDescription() +
        "\nUsuario: " +
        mov.getUser()
    );
  });
}

function displayTransactionStored() {
  const storedTransactions = localStorage.getItem("transactionsList");
  if (storedTransactions) {
    const datos = JSON.parse(storedTransactions);
    console.log(datos);
  } else {
    console.log("No hay transactions en local storage");
  }
}

function getListOfTransactionsByCurrentUser() {
  const storedTransactions = localStorage.getItem("transactionsList");
  if (storedTransactions) {
    const datos = JSON.parse(storedTransactions);
    transactionsList = datos
      .filter((t) => t.user === currentUser)
      .map((t) => {
        const transaction = new Transaction(
          t.type === "Ingreso" ? "1" : "2",
          t.amount,
          t.description,
          t.user
        );
        transaction.uuid = t.uuid;
        return transaction;
      });
    renderMovementsView();
  }
}

//Funcion para hacer el login del usuario, verifica un nombre y edad
function loginUsuario() {
  console.log("Bienvenido al simulador de finanzas personales");
  const nombreInput = document.getElementById("login-nombre").value.trim();
  const edadInput = parseInt(document.getElementById("login-edad").value);

  if (!/^[a-zA-Z]+$/.test(nombreInput)) {
    darkSwal.fire(
      "Usuario Incorrecto",
      "El nombre debe contener solo letras, sin espacios ni símbolos",
      "error"
    );
    document.getElementById("login-nombre").value = "";
    document.getElementById("login-edad").value = "";
    return;
  }

  if (isNaN(edadInput)) {
    darkSwal.fire("Usuario Incorrecto", "La edad debe ser un número", "error");
    document.getElementById("login-nombre").value = "";
    document.getElementById("login-edad").value = "";
    return;
  }

  if (edadInput < 18) {
    darkSwal.fire(
      "Usuario Incorrecto",
      "Debes ser mayor de 18 años para ingresar",
      "error"
    );
    document.getElementById("login-nombre").value = "";
    document.getElementById("login-edad").value = "";
    return;
  }
  darkSwal.fire({
    title: `Hola ${nombreInput}!`,
    text: "Bienvenido a la plataforma",
    icon: "success",
  });

  // Mostrar el name, app y ocultar el login
  document.getElementById("user-name").innerText = nombreInput;
  document.getElementById("login-container").style.display = "none";
  document.getElementById("app-container").style.display = "block";
  document.getElementById("login-nombre").value = "";
  document.getElementById("login-edad").value = "";
  currentUser = nombreInput;
  sessionStorage.setItem("currentUser", currentUser);
  getListOfTransactionsByCurrentUser();
  displayTransactions();
}

function mainWindow() {
  console.log("usuario en la sesion: " + currentUser);
  document.getElementById("user-name").innerText = currentUser;
  document.getElementById("login-container").style.display = "none";
  document.getElementById("app-container").style.display = "block";
  getListOfTransactionsByCurrentUser();
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem("currentUser");
      document.getElementById("login-container").style.display = "block";
      document.getElementById("app-container").style.display = "none";
    });
  }
}

function main() {
  const sessionUser = sessionStorage.getItem("currentUser");
  if (sessionUser !== null) {
    console.log("usuario en la sesion: " + sessionUser);
    currentUser = sessionUser;
    mainWindow();
    displayTransactions();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-click-button");
    const addMovementBtn = document.getElementById(
      "register-new-movement-button"
    );

    if (loginBtn) {
      loginBtn.addEventListener("click", loginUsuario);
    }

    if (addMovementBtn) {
      addMovementBtn.addEventListener("click", registerNewMovement);
    }
  });
}

main();
