$(document).ready(() => {
    const game = new Game($(".go-board"), $(".board tbody"));
    const adjustSize = adjustSizeGen();

    // Adjust layout on window resize
    $(window).on("resize", adjustSize);
    adjustSize();

    // Configure default page transitions
    $.mobile.defaultDialogTransition = "flow";
    $.mobile.defaultPageTransition = "flow";

    // Bind settings change events
    $('#mode-select input[type="radio"]').on("change", (event) => {
        gameData.mode = event.target.value;
    });

    $('#color-select input[type="radio"]').on("change", (event) => {
        gameData.color = event.target.value;
    });

    $('#level-select input[type="radio"]').on("change", (event) => {
        gameData.level = event.target.value;
    });

    // Back to game
    $(".back-to-game").on("tap", () => {
        $.mobile.changePage("#game-page");
    });

    // Start game button
    $("#start-game").on("click", () => {
        try {
            game.white.worker?.terminate();
            game.black.worker?.terminate();
        } catch (error) {
            console.error("Error terminating workers:", error);
        }

        if (gameData.mode === "vshuman") {
            game.mode = "hvh";
            game.init(new HumanPlayer("black"), new HumanPlayer("white"));
        } else {
            const [playerColor, opponentColor] = gameData.color === "black" ? ["black", "white"] : ["white", "black"];
            game.mode = gameData.level;
            game.init(new HumanPlayer(playerColor), new AIPlayer(game.mode, opponentColor));
        }

        $.mobile.changePage("#game-page");
        game.start();
        setTimeout(() => $(".back-to-game").button("enable"), 100);
    });

    // Undo button
    $("#undo-button").on("tap", () => {
        game.undo();
    });

    // Fullscreen wrapper tap
    $(".fullscreen-wrapper").on("tap", function () {
        $(this).hide();
        $.mobile.changePage("#game-won");
    });

    // Page initialization
    $("#new-game, #game-won").page();

    // Load game data and initialize
    gameData.load();
    $(".back-to-game").button("disable");
    $.mobile.changePage("#new-game", { changeHash: false });

    // Game Info Utility
    window.gameInfo = (() => {
        let blinking = false;
        let text = "";
        let color = "";

        const mainObj = $("#game-info");
        const textObj = $("#game-info > .cont");
        const colorObj = $("#game-info > .go");

        return {
            getBlinking: () => blinking,
            setBlinking: (val) => {
                blinking = val;
                mainObj.toggleClass("blinking", val);
            },
            getText: () => text,
            setText: (val) => {
                text = val;
                textObj.html(val);
            },
            getColor: () => color,
            setColor: (newColor) => {
                colorObj.removeClass("white black");
                if (newColor) colorObj.addClass(newColor);
            }
        };
    })();
});

// Show win dialog
function showWinDialog(game) {
    gameInfo.setBlinking(false);

    const winner = game.getCurrentPlayer();
    const isHumanPlayer = winner instanceof HumanPlayer;

    if (game.mode === "hvh") {
        const winnerColor = winner.color.charAt(0).toUpperCase() + winner.color.slice(1);
        $("#game-won h4").html(`${winnerColor} Won!`);
        gameInfo.setText(`${winnerColor} won.`);
        $("#win-content").html(`${winnerColor} won the game. Play again?`);
        $("#happy-outer").fadeIn(500);
    } else {
        const title = isHumanPlayer ? "You Won!" : "You Lost.";
        const content = isHumanPlayer
            ? "Great job! You won the game. Can you do it again?"
            : "Oh no! The AI won. Try again?";

        $("#game-won h4").html(title);
        $("#win-content").html(content);
        gameInfo.setText(isHumanPlayer ? "You won." : "AI won.");
        const animationTarget = isHumanPlayer ? "#sad-outer" : "#happy-outer";
        $(animationTarget).fadeIn(800);
    }
}
