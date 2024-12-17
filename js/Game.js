class Game {
    constructor(boardElm, boardBackgroundElm) {
        this.mode = "hvh";
        this.rounds = 0;
        this.playing = false;
        this.history = [];
        this.currentColor = "black";

        this.players = {};
        this.board = new Board(boardElm, boardBackgroundElm);

        // Bind board click event
        this.board.clicked = (r, c) => {
            const player = this.players[this.currentColor];
            if (player instanceof HumanPlayer) {
                player.setGo(r, c);
            }
        };
    }

    getCurrentPlayer() {
        return this.players[this.currentColor];
    }

    setCurrentColor(color) {
        this.currentColor = color;
    }

    toHuman(color) {
        this.board.setClickable(true, color);
    }

    toOthers() {
        this.board.setClickable(false);
    }

    update(r, c, color) {
        if (!this.playing) return;

        this.rounds++;
        this.board.updateMap(r, c, color);

        this.players.black.watch(r, c, color);
        this.players.white.watch(r, c, color);

        setTimeout(() => this.progress(), 0);
    }

    progress() {
        const nextPlayer = this.currentColor === "black" ? this.players.white : this.players.black;
        nextPlayer.myTurn();
    }

    setGo(r, c, color) {
        if (!this.playing || this.board.isSet(r, c)) return false;

        this.history.push({ r, c, color });
        this.board.highlight(r, c);
        this.board.setGo(r, c, color);

        const result = this.board.getGameResult(r, c, color);

        if (result === "draw") {
            this.draw();
        } else if (result === "win") {
            this.win();
            this.board.winChange(r, c, color);
        } else {
            this.update(r, c, color);
        }
        return true;
    }

    undo() {
        if (!this.playing && !this.history.length) return;

        do {
            if (!this.history.length) return;

            const last = this.history.pop();
            this.board.unsetGo(last.r, last.c);
            this.players.white.watch(last.r, last.c, "remove");
            this.players.black.watch(last.r, last.c, "remove");

        } while (this.players[this.history[this.history.length - 1]?.color] instanceof AIPlayer);

        const last = this.history[this.history.length - 1];
        if (last) {
            this.board.highlight(last.r, last.c);
        } else {
            this.board.unHighlight();
        }

        this.players[this.currentColor].other.myTurn();

        // Cancel AI calculations
        Object.values(this.players).forEach(player => {
            if (player instanceof AIPlayer && player.computing) {
                player.cancel++;
            }
        });
    }

    draw() {
        this.playing = false;
        this.board.setClickable(false);
    }

    win() {
        this.playing = false;
        this.board.setClickable(false);
        showWinDialog(this);
    }

    init(player1, player2) {
        console.log("Initializing players:", player1, player2);
        this.rounds = 0;
        this.history = [];
        this.board.init();

        this.players = {
            [player1.color]: player1,
            [player2.color]: player2,
        };

        this.players.white.game = this;
        this.players.black.game = this;

        this.players.white.other = this.players.black;
        this.players.black.other = this.players.white;

        if (!(this.players.black instanceof HumanPlayer)) {
            this.board.setWarning(0, true);
        }
        if (!(this.players.white instanceof HumanPlayer)) {
            this.board.setWarning(1, true);
        }
    }

    start() {
        this.playing = true;
        this.players.black.myTurn();
    }
}
