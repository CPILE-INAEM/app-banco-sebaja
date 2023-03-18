"use strict";
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP
// Data
const account1 = {
  owner: "Juan Sánchez",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};
const account2 = {
  owner: "María Portazgo",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};
const account3 = {
  owner: "Estefanía Pueyo",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};
const account4 = {
  owner: "Javier Rodríguez",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};
const accounts = [account1, account2, account3, account4];
let activeAccount = {};
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// init data
const createUsernames = () => {
  accounts.forEach((account) => {
    account.username = account.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

const randomDate = () => {
  const fechaInicio = new Date(1970, 0, 1); // 1 de enero de 1970
  const fechaFin = new Date(); // Fecha actual
  const fechaAleatoria = new Date(
    fechaInicio.getTime() +
      Math.random() * (fechaFin.getTime() - fechaInicio.getTime())
  );
  const anio = fechaAleatoria.getFullYear();
  const mes = fechaAleatoria.getMonth() + 1;
  const dia = fechaAleatoria.getDate();
  return `${anio}-${mes}-${dia}`;
};

const createDates = () => {
  accounts.forEach((account) => {
    const tempMovements = [];
    account.movements.forEach((movement) => {
      const fecha = randomDate();
      const cantidad = movement;
      const newMovement = {};
      newMovement.date = fecha;
      newMovement.value = cantidad;
      tempMovements.push(newMovement);
    });
    account.movements = tempMovements;
  });
};

createUsernames();
createDates();

// FUNCIÓN LOGIN
btnLogin.addEventListener("click", (e) => {
  // Prevent form from submitting
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);
  console.log(`Intento login con el usuario ${username} y el pin ${pin}`);
  // recorrer todos los accounts y buscar el que coincida con el username
  //y luego comparar el pin
  const currentAccount = accounts.find(
    (account) => account.username === username
  );
  // puede ser null si el usuario no existe
  // currentAccount && currentAccount.pin === currentAccount?.pin
  if (currentAccount?.pin === pin) {
    console.log("Login correcto");
    // cargamos los datos y visualizamos
    labelWelcome.textContent = `Bienvenido ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 1;
    // limpiar campos y quitar foco
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    activeAccount = currentAccount;
    console.log(activeAccount);
    // mostrar datos
    updateUI(currentAccount);
  }
});

// FUNCIÓN TRANSFERENCIAS
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  //usuario a transferir
  const transferTo = inputTransferTo.value;
  //cantidad a transferir
  const transferAmount = Number(inputTransferAmount.value);
  //cuenta a transferir
  const accountTo = accounts.find((account) => account.owner === transferTo);
  const balance = activeAccount.movements.reduce(
    (acc, mov) => acc + mov.value,
    0
  );
  //si la cuenta a transferir existe, la cantidad a transferir es mayor que 0 y menor que el balance
  if (!accountTo) alert("El benificiario no existe.");
  else if (transferAmount <= 0 || balance < transferAmount)
    alert("La cantidad introducida no es correcta.");
  else {
    const tempMovement = {};
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    tempMovement.value = transferAmount;
    tempMovement.date = `${anio}-${mes}-${dia}`;
    accountTo.movements.push(tempMovement);
    tempMovement.value = -transferAmount;
    activeAccount.movements.push(tempMovement);
    //vaciar campos
    inputTransferTo.value = inputTransferAmount.value = "";
    alert("Transferencia realizada con exito");
    updateUI(activeAccount);
  }
});

// FUNCIÓN PRÉSTAMOS
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();
  requestLoan();
});
const requestLoan = function () {
  // importe préstamo
  const loan = Number(inputLoanAmount.value);

  // const balance = activeAccount.movements.reduce((acc, mov) => acc + mov, 0);
  // let totalLoan = loan + balance;
  if (loan <= 0) {
    alert("No ha ingresado un valor válido");
  } else {
    const loanMovement = {};
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    loanMovement.value = loan;
    loanMovement.date = `${anio}-${mes}-${dia}`;
    activeAccount.movements.push(loanMovement);
    // vaciar campos
    inputLoanAmount.value = "";
    // labelBalance.textContent = `${loan.toFixed(2)}€`;
    alert("Préstamo solicitado con éxito");
    updateUI(activeAccount);
  }
};

// FUNCIÓN ACTUALIZAR USER INTERFACE
const updateUI = (currentAccount) => {
  // mostrar movimientos
  const { movements } = currentAccount;
  displayMovements(movements);
  // mostrar balance
  calcAndDisplayBalance(movements);
  // mostrar resumen
  calcAndDisplaySummary(currentAccount);
};

const calcAndDisplayBalance = (movements) => {
  const balance = movements.reduce((acc, mov) => acc + mov.value, 0);
  labelBalance.textContent = `${balance.toFixed(2)}€`;
};
const calcAndDisplaySummary = (currentAccount) => {
  // obtener movimientos
  const { movements } = currentAccount;
  // const movements = currentAccount.movements;
  const incomes = movements
    .filter((mov) => mov.value > 0)
    .reduce((acc, mov) => acc + mov.value, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;
  const outcomes = movements
    .filter((mov) => mov.value < 0)
    .reduce((acc, mov) => acc + mov.value, 0);
  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)}€`;
  // const summary = Number(incomes + outcomes);
  // console.log(summary);
  // cálculo de intereses:
  // 1. Teniendo en cuenta solo ingresos superiores a 100€
  // y que el interés es de cada usuario
  // y que los intereses sean superiores a 2€
  const interest = movements
    .filter((mov) => mov.value > 100)
    .map((mov) => (mov.value * currentAccount.interestRate) / 100)
    .filter((int) => int >= 2)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}`;
};
const displayMovements = (movements) => {
  // insertarlos con insertAdjacentHTML
  // comprobar si son positivos o negativos para la inserción
  //foreach para recorrer los movimientos
  //ternario para ver si es depósito o retiro
  // limpiar movimientos antiguos:
  containerMovements.innerHTML = "";
  // let count = 1;
  // count++; Esta es otra forma de ir incrementando un valor 1 a 1
  // SOLUCIÓN DADA POR EL PROFESOR
  movements.forEach((mov, i) => {
    const type = mov.value > 0 ? "deposit" : "withdrawal";
    const movHTML = `<div class="movements__row">
                      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
                      <div class="movements__date">${mov.date}</div>
                      <div class="movements__value">${mov.value.toFixed(
                        2
                      )}€</div>
                    </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", movHTML);
  });
  // PRIMERA SOLUCIÓN HECHA POR NOSOTROS
  // movements.forEach((mov, i) => {
  //   const movHTML = `<div class="movements__row">
  //                     <div class="movements__type ${
  //                       mov > 0
  //                         ? "movements__type--deposit"
  //                         : "movements__type--withdrawal"
  //                     }">${i + 1} ${mov > 0 ? "deposit" : "withdrawal"}</div>
  //                     <div class="movements__date"></div>
  //                     <div class="movements__value">${mov}€</div>
  //                   </div>`;
  //   console.log(movHTML);
  //   containerMovements.insertAdjacentHTML("afterbegin", movHTML);
  // });
  // containerMovements
};
