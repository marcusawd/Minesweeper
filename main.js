/*----- constants -----*/

/*----- state variables -----*/

let minefield = [];
let rows = 0;
let cols = 0;
let numMines = 0;

document
	.getElementById("settings-form")
	.addEventListener("submit", function (event) {
		event.preventDefault();

		const form = event.target;
		const difficulty = form.difficulty.value;

		if (difficulty === "custom") {
			rows = Number(form.rows.value);
			cols = Number(form.cols.value);
			numMines = Number(form.numMines.value);
		} else if (difficulty === "easy") {
			rows = 9;
			cols = 9;
			numMines = 10;
		} else if (difficulty === "medium") {
			rows = 14;
			cols = 14;
			numMines = 30;
		} else if (difficulty === "hard") {
			rows = 19;
			cols = 19;
			numMines = 60;
		}

		init(); // Initialize the game board
	});

/*----- cached elements -----*/
const board = document.querySelector("#board");

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
	}

	cell.flagged = !cell.flagged;

	renderCell(cell);
	checkWin();
	console.log(cell);
};

/*----- render functions -----*/
const renderBoard = () => {
	board.innerHTML = "";
	board.style.setProperty("--rows", rows);
	board.style.setProperty("--cols", cols);

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
	console.log("You Win!");
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
	console.log("You lose");
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
	}
};

function init() {
	initBoard();
	renderBoard();
}
