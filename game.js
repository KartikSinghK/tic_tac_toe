const overlay = document.querySelector(".overlay");

const player = (name, move) => {
	let playerMove = move;
	let playerName = name;
	return { playerName, playerMove };
};

const game = (() => {
	const board = document.querySelector(".board");
	const level = document.querySelector(".dropdown-menu");
	const restart = document.querySelector(".restart");
	const tiles = (() => {
		const rows = [...document.querySelectorAll(".row")];
		const tiles = [];
		for (let i = 0; i < rows.length; i++) {
			tiles.push([...rows[i].querySelectorAll("p")]);
		}
		return tiles;
	})();
	const showResult = (wonBy = "") => {
		overlay.classList.toggle("hide");
		if (wonBy === "") {
			overlay.firstElementChild.innerText = "It's a draw";
		} else {
			overlay.firstElementChild.innerText = `${wonBy} won`;
		}
	};
	const opponent = player("You", "X");
	const AI = player("AI", "O");
	let movesLeft = 9;
	return {
		board,
		level,
		restart,
		tiles,
		opponent,
		AI,
		movesLeft,
		showResult,
	};
})();

const position = [
	["", "", ""],
	["", "", ""],
	["", "", ""],
];

const checkResult = (currentPlayer) => {
	let tiles = game.tiles;
	for (let i = 0; i < tiles.length; i++) {
		if (
			currentPlayer.playerMove === tiles[i][0].innerText &&
			currentPlayer.playerMove === tiles[i][1].innerText &&
			currentPlayer.playerMove === tiles[i][2].innerText
		)
			return true;

		if (
			currentPlayer.playerMove === tiles[0][i].innerText &&
			currentPlayer.playerMove === tiles[1][i].innerText &&
			currentPlayer.playerMove === tiles[2][i].innerText
		)
			return true;
	}
	if (
		currentPlayer.playerMove === tiles[0][0].innerText &&
		currentPlayer.playerMove === tiles[1][1].innerText &&
		currentPlayer.playerMove === tiles[2][2].innerText
	)
		return true;
	if (
		currentPlayer.playerMove === tiles[0][2].innerText &&
		currentPlayer.playerMove === tiles[1][1].innerText &&
		currentPlayer.playerMove === tiles[2][0].innerText
	)
		return true;

	return false;
};

const playMove = ({ target }) => {
	if (
		target.classList.contains("col") &&
		target.firstElementChild.innerText === ""
	) {
		let tile = target.firstElementChild;
		let j = parseInt(target.attributes.data.nodeValue);
		let i = parseInt(target.parentElement.attributes.data.nodeValue);
		position[i][j] = game.opponent.playerMove;
		tile.innerText = game.opponent.playerMove;
		game.movesLeft--;
		game.board.removeEventListener("click", playMove);
		if (checkResult(game.opponent)) {
			game.showResult("You");
			return;
		} else {
			if (game.movesLeft === 0) {
				game.showResult();
				return;
			}
		}
		// AI move
		setTimeout(() => {
			playBestMove(position);
			game.movesLeft--;
			if (checkResult(game.AI)) {
				game.board.removeEventListener("click", playMove);
				game.showResult("AI");
			} else {
				if (game.movesLeft === 0) {
					console.log("draw");
					game.showResult();
				}
			}
			game.board.addEventListener("click", playMove);
		}, 800);
	}
};

game.board.addEventListener("click", playMove);

game.restart.addEventListener("click", () => {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			game.tiles[i][j].innerText = "";
			position[i][j] = "";
		}
	}
	game.board.addEventListener("click", playMove);
	game.movesLeft = 9;
});

overlay.addEventListener("click", () => {
	overlay.classList.toggle("hide");
});

// position is a 2D arry representing the board
function evaluate(position, opponent, AI, depth) {
	for (let i = 0; i < 3; i++) {
		// To check rows
		if (
			position[i][0] === position[i][1] &&
			position[i][1] === position[i][2]
		) {
			if (position[i][1] === opponent.playerMove) return depth - 10;
			if (position[i][1] === AI.playerMove) return 10 - depth;
		}

		// To check cols
		if (
			position[0][i] === position[1][i] &&
			position[1][i] === position[2][i]
		) {
			if (position[1][i] === opponent.playerMove) return depth - 10;
			if (position[1][i] === AI.playerMove) return 10 - depth;
		}
	}

	// checking diagonals
	if (
		position[0][0] === position[1][1] &&
		position[1][1] === position[2][2]
	) {
		if (position[1][1] === opponent.playerMove) return depth - 10;
		if (position[1][1] === AI.playerMove) return 10 - depth;
	}

	if (
		position[0][2] === position[1][1] &&
		position[1][1] === position[2][0]
	) {
		if (position[1][1] === opponent.playerMove) return depth - 10;
		if (position[1][1] === AI.playerMove) return 10 - depth;
	}

	return 0;
}

function areMovesLeft() {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (position[i][j] === "") return true;
		}
	}
	return false;
}

function minimax(depth, position, isMax) {
	let score = evaluate(position, game.opponent, game.AI, depth);
	if (score) return score;

	if (areMovesLeft() === false) return 0;
	if (isMax) {
		let maxVal = -1000;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (position[i][j] === "") {
					position[i][j] = game.AI.playerMove;

					maxVal = Math.max(
						maxVal,
						minimax(depth + 1, position, !isMax)
					);

					position[i][j] = "";
				}
			}
		}
		return maxVal;
	} else {
		let minVal = 1000;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (position[i][j] === "") {
					position[i][j] = game.opponent.playerMove;
					minVal = Math.min(
						minVal,
						minimax(depth + 1, position, !isMax)
					);
					position[i][j] = "";
				}
			}
		}
		return minVal;
	}
}

function playBestMove(position) {
	let bestVal = -1000;
	let row = -1;
	let col = -1;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (position[i][j] === "") {
				position[i][j] = game.AI.playerMove;
				let tempVal = minimax(0, position, false);
				position[i][j] = "";
				if (tempVal > bestVal) {
					row = i;
					col = j;
					bestVal = tempVal;
				}
			}
		}
	}
	game.tiles[row][col].innerText = game.AI.playerMove;
	position[row][col] = game.AI.playerMove;
}
