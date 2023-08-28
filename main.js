/*----- constants -----*/

/*----- state variables -----*/

let minefield = [];
let rows = 0;
let cols = 0;
let numMines = 0;
let bombsLeft = 0;
// let gameState = "";

document.getElementById("difficulty").addEventListener("change", function () {
	const selectedDifficulty = this.value;
	const rowsInput = document.getElementById("rows");
	const colsInput = document.getElementById("cols");
	const numMinesInput = document.getElementById("numMines");

	if (selectedDifficulty === "easy") {
		rowsInput.value = "9";
		colsInput.value = "9";
		numMinesInput.value = "10";
	} else if (selectedDifficulty === "medium") {
		rowsInput.value = "14";
		colsInput.value = "14";
		numMinesInput.value = "30";
	} else if (selectedDifficulty === "hard") {
		rowsInput.value = "19";
		colsInput.value = "19";
		numMinesInput.value = "60";
	} else if (selectedDifficulty === "custom") {
		rowsInput.value = "0";
		colsInput.value = "0";
		numMinesInput.value = "0";
	}
});

document
	.getElementById("settings-form")
	.addEventListener("submit", function (event) {
		event.preventDefault();

		const form = event.target;
		rows = form.rows.value;
		cols = form.cols.value;
		numMines = form.numMines.value;

		init();
	});

/*----- cached elements -----*/
const board = document.querySelector("#board");
const endScreen = document.querySelector("#end-screen");
const bombCounter = document.querySelector("#bombs-count");

/*----- event listeners -----*/
const handleCellClick = (row, col) => {
	const cell = minefield[row][col];

	if (!cell.revealed && !cell.flagged) {
		cell.revealed = true;
		renderCell(cell);

		if (cell.mine) {
			renderLosePage();
		} else {
			if (cell.adjMines === 0) {
				floodFill(row, col);
			}
			checkWin();
		}
	}
};

const handleRightClick = (row, col) => {
	const cell = minefield[row][col];

	if (cell.revealed) {
		floodFill(row, col);
	} else {
		cell.flagged = !cell.flagged;

		if (cell.flagged) {
			bombsLeft--;
		} else {
			bombsLeft++;
		}

		bombCounter.textContent = bombsLeft;
	}

	renderCell(cell);
	checkWin();
	console.log(cell);
};

/*----- render functions -----*/
const renderBoard = () => {
	board.innerHTML = "";
	board.style.setProperty("--rows", rows);
	board.style.setProperty("--cols", cols);
	bombsLeft = numMines;
	bombCounter.textContent = bombsLeft;

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const cell = document.createElement("div");
			cell.classList.add("cell");
			cell.setAttribute("data-row", i);
			cell.setAttribute("data-col", j);

			cell.addEventListener("click", () => {
				handleCellClick(i, j);
			});

			cell.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				handleRightClick(i, j);
			});

			board.appendChild(cell);
		}
	}
};

const renderCell = (cell) => {
	const cellElement = document.querySelector(
		`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`,
	);

	cellElement.classList.remove("revealed", "flagged");

	if (cell.revealed) {
		cellElement.classList.add("revealed");
		if (cell.mine) {
			cellElement.innerHTML = "B";
		} else {
			cellElement.innerHTML = cell.adjMines === 0 ? "" : cell.adjMines;
		}
	} else if (cell.flagged) {
		cellElement.classList.add("flagged");
		//* Place a flag
		cellElement.innerHTML = "?";
	}
};

const renderWinPage = () => {
	const winGame = document.querySelector("#win-game");
	winGame.innerHTML = "GAME OVER. YOU WIN";
	endScreen.style.display = "flex";
};

const renderLosePage = () => {
	//* Reveal all mine positions?
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const cell = minefield[i][j];
			if (cell.mine) {
				cell.revealed = true;
				renderCell(cell);
			}
		}
	}

	const loseGame = document.querySelector("#lose-game");
	loseGame.innerHTML = "GAME OVER. YOU LOSE";
	endScreen.style.display = "flex";

	// gameState = "lose";
};

/*----- game logic functions -----*/
const initBoard = () => {
	//* Initialise the minefield, place mines & calculateAdjMines
	for (let i = 0; i < rows; i++) {
		minefield[i] = [];
		for (let j = 0; j < cols; j++) {
			minefield[i][j] = {
				mine: false,
				revealed: false,
				flagged: false,
				adjMines: 0,
				row: i,
				col: j,
			};
		}
	}
	placeMines();
	calculateAdjMines();
	console.log(minefield);
};

const placeMines = () => {
	let placedMines = 0;
	while (placedMines < numMines) {
		const row = Math.floor(Math.random() * rows);
		const col = Math.floor(Math.random() * cols);
		if (!minefield[row][col].mine) {
			minefield[row][col].mine = true;
			placedMines++;
		}
	}
};

const calculateAdjMines = () => {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const cell = minefield[i][j];
			if (!cell.mine) {
				cell.adjMines = countAdjMines(i, j);
			}
		}
	}
};

const countAdjMines = (row, col) => {
	let count = 0;
	for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, rows - 1); i++) {
		for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, cols - 1); j++) {
			if (minefield[i][j].mine) {
				count++;
			}
		}
	}
	return count;
};

const floodFill = (row, col) => {
	for (let i = row - 1; i <= row + 1; i++) {
		for (let j = col - 1; j <= col + 1; j++) {
			if (i >= 0 && i < rows && j >= 0 && j < cols) {
				const cell = minefield[i][j];
				if (!cell.revealed && !cell.flagged) {
					cell.revealed = true;
					renderCell(cell);
					if (cell.mine) {
						renderLosePage();
						break;
					}
					if (cell.adjMines === 0) {
						floodFill(i, j);
					}
				}
			}
		}
	}
};

const checkWin = () => {
	let allNonMinesRevealed = true;

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const cell = minefield[i][j];
			//* If the cell does not have a mine and is not revealed, game continues
			if (!cell.mine && !cell.revealed) {
				allNonMinesRevealed = false;
				break;
			}
		}
	}

	if (allNonMinesRevealed) {
		renderWinPage();
		// gameState = "win";
	}
};

function init() {
	initBoard();
	renderBoard();

	const startScreen = document.querySelector("#start-screen");
	const gameScreen = document.querySelector("#game-screen");

	startScreen.style.display = "none";
	gameScreen.style.display = "block";
}
