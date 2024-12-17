// Base class for all players
class Player {
    constructor(color, game) {
        this.color = color;
        this.game = game;
    }

    myTurn() {
        this.game.setCurrentColor(this.color);
        const colorName = this.color.charAt(0).toUpperCase() + this.color.slice(1);
        gameInfo.setText(`${colorName}'s turn.`);
        gameInfo.setColor(this.color);
        gameInfo.setBlinking(false);
    }

    watch() {
        // Placeholder for subclasses to override
    }

    setGo(row, col) {
        return this.game.setGo(row, col, this.color);
    }
}

// Class for Human Player
class HumanPlayer extends Player {
    constructor(color, game) {
        super(color, game);
    }

    myTurn() {
        super.myTurn();
        this.game.toHuman(this.color);
        if (this.other instanceof AIPlayer) {
            gameInfo.setText('Your turn');
        }
    }
}

// Class for AI Player
class AIPlayer extends Player {
    constructor(mode, color, game) {
        super(color, game);
        this.mode = mode;
        this.computing = false;
        this.cancel = 0;
        this.worker = new Worker('js/ai-worker.js');

        this.worker.onmessage = (e) => this.handleWorkerMessage(e);
        this.worker.postMessage({
            type: 'ini',
            color: this.color,
            mode: this.mode,
        });
    }

    myTurn() {
        super.myTurn();
        this.game.toOthers();
        gameInfo.setText('Thinking...');
        gameInfo.setBlinking(true);
        this.move();
    }

    watch(row, col, color) {
        this.worker.postMessage({
            type: 'watch',
            r: row,
            c: col,
            color: color,
        });
    }

    move() {
        if (this.game.rounds === 0) {
            this.setGo(7, 7); // Default first move
        } else if (this.game.rounds === 1) {
            const moves = [
                [6, 6], [6, 7], [6, 8],
                [7, 6], [7, 7], [7, 8],
                [8, 6], [8, 7], [8, 8],
            ];
            while (moves.length) {
                const index = Math.floor(Math.random() * moves.length);
                const [row, col] = moves.splice(index, 1)[0];
                if (this.setGo(row, col)) {
                    return;
                }
            }
        } else {
            this.worker.postMessage({ type: 'compute' });
        }
    }

    handleWorkerMessage(e) {
        switch (e.data.type) {
            case 'decision':
                this.computing = false;
                if (this.cancel > 0) {
                    this.cancel--;
                } else {
                    this.setGo(e.data.r, e.data.c);
                }
                break;

            case 'starting':
                this.computing = true;
                break;

            case 'alert':
                alert(e.data.msg);
                break;

            default:
                console.log(e.data);
        }
    }
}
