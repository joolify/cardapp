let gameState = {
    score: null,
    time: null,
    isPaused: false,
    remaining: null,
    lastPlayerCard: "none",
    lastComputerCard: "none",
    firstCard: false,
    timer: null,
    gameloop: null,
    deckid: null,
    baseUrl: "https://deckofcardsapi.com/api/deck/",
    gameOver: false
};

$(function () {
    $("#btnNewGame").click(newGame);
    $("#btnPauseGame").click(pauseGame);
    $("#btnSaveGame").click(saveGame);
    $("#btnHighScores").click(highScores);
    $("#btnFeedback").click(feedback);

    $("#btnSaveGame").prop("disabled", true);
    $("#btnPauseGame").prop("disabled", true);
    $("#scoreBoard").hide();
    $("#feedback").hide();
});

function newGame() {
    $("#game").show();
    $("#scoreBoard").hide();
    $("#feedback").hide();

    gameState.score = 0;
    gameState.time = 0;

    $("#seconds").html("00");
    $("#minutes").html("00");

    $("#btnNewGame").prop("disabled", true);
    $("#btnSaveGame").prop("disabled", true);
    $("#btnPauseGame").prop("disabled", false);
    $("#btnHighScores").prop("disabled", true);
    $("#btnFeedback").prop("disabled", true);

    $("#deckCard").attr("src", "images/red_back.png");
    $("#playerCard").attr("src", "images/none.png");
    $("#computerCard").attr("src", "images/none.png");
    $("#discardCard").attr("src", "images/none.png");

    $.getJSON(gameState.baseUrl + "new/shuffle/")
        .done(function (data) {
            gameState.deckid = data.deck_id;
            gameState.remaining = data.remaining;

            drawPlayerCard();

            $("#computerCard").attr("src", "images/loading.gif");

            startGameLoop();
        });

    gameState.timer = setInterval(setTime, 1000);
}

function pauseGame() {
    gameState.isPaused = true;
    $("#btnPauseGame").html("Start");
    $("#btnPauseGame").off("click");
    $("#btnPauseGame").click(startGame);
    $("#playerCard").off("click");
    $("#playerCard").removeClass("clickable");
    clearTimeout(gameState.gameloop);
}

function startGame() {
    gameState.isPaused = false;
    $("#btnPauseGame").html("Pause");
    $("#btnPauseGame").off("click");
    $("#btnPauseGame").click(pauseGame);
    $("#playerCard").click(playCard);
    $("#playerCard").addClass("clickable");

    startGameLoop();
}

function startGameLoop() {
    (function loop() {
        var rand = Math.round(Math.random() * 3000);
        gameState.gameloop = setTimeout(function () {
            drawComputerCard();
            loop();
        }, rand);
    }());
}

function saveGame() {
    let name = prompt("Please enter a name:");

    if (name !== null) {
        let scoreObj = {
            name: name,
            date: getDate(),
            score: gameState.score,
            time: gameState.time
        };

        let scores = JSON.parse(localStorage.getItem("scores"));
        if (scores === null) {
            localStorage.setItem("scores", JSON.stringify([scoreObj]));
        } else {
            scores.push(scoreObj);
            localStorage.setItem("scores", JSON.stringify(scores));
        }
        highScores();
    }
    $("#btnSaveGame").prop("disabled", true);
    $("#btnHighScores").prop("disabled", false);
    $("#btnFeedback").prop("disabled", false);
}

function highScores() {
    $("#game").hide();
    $("#feedback").hide();
    $("#scoreBoard").show();

    showScoreBoard();
}

function feedback() {
    $("#game").hide();
    $("#scoreBoard").hide();
    $("#feedback").show();
    $("#feedback").load("feedback.html", feedbackLoad);
}

function feedbackLoad() {
    $("#feedbackForm").submit(feedbackSubmit);
    $("#happinessValue").text($("#happiness").val());
    $("#happiness").mousemove(showHappiness);
    showFeedback();
}

function feedbackSubmit(e) {
    $("#game").hide();
    $("#scoreBoard").hide();

    let feedbackObj = {
        name: $("#name").val(),
        happiness: $("#happiness").val(),
        color: $("#color").val()
    };

    let feedback = JSON.parse(localStorage.getItem("feedback"));
    if (feedback === null) {
        localStorage.setItem("feedback", JSON.stringify([feedbackObj]));
    } else {
        feedback.push(feedbackObj);
        localStorage.setItem("feedback", JSON.stringify(feedback));
    }

    showFeedback();

    e.preventDefault();
}

function showHappiness() {
    $("#happinessValue").text($("#happiness").val());
}

function showFeedback() {
    let feedbacks = JSON.parse(localStorage.getItem("feedback"));
    let tableRef = $("#feedbackTable tbody");
    tableRef.empty();
    if (feedbacks !== null) {
        feedbacks.forEach(
            function (feedback) {
                let row = $("<tr><td>" +
                    feedback.name +
                    "</td><td>" +
                    feedback.happiness +
                    "</td></tr>"
                );
                let cell = $("<td>");
                cell.css('background-color', feedback.color);
                row.append(cell);
                tableRef.append(row);
            }
        );
    }
}

function isGameOver() {
    if (gameState.remaining > 0)
        return false;

    if (!gameState.gameOver) {
        gameState.gameOver = true;
        clearInterval(gameState.timer);
        clearTimeout(gameState.gameloop);

        $("#deckCard").attr("src", "images/none.png");

        if (gameState.score > 0) {
            alert("You won! Your score was: " + gameState.score);
        } else {
            alert("You lost! Your score was: " + gameState.score);
        }

        $("#btnPauseGame").prop("disabled", true);
        $("#btnNewGame").prop("disabled", false);
        $("#btnSaveGame").prop("disabled", false);
        $("#btnHighScores").prop("disabled", false);
        $("#btnFeedback").prop("disabled", false);
        return true;
    }
}

function drawPlayerCard() {
    if (!isGameOver()) {
        $.getJSON(gameState.baseUrl + gameState.deckid + "/draw/", { count: 1 })
            .done(function (deck) {
                gameState.remaining = deck.remaining;

                let playerCard = deck.cards[0];
                if (playerCard !== undefined) {
                    $("#playerCard").attr("src", playerCard.image);
                    gameState.lastPlayerCard = playerCard;
                }
            });
    }
}

function drawComputerCard() {
    if (!isGameOver()) {
        $.getJSON(gameState.baseUrl + gameState.deckid + "/draw/", { count: 1 })
            .done(function (deck) {
                $("#discardCard").attr("src", gameState.lastComputerCard.image);
                gameState.remaining = deck.remaining;

                let computerCard = deck.cards[0];
                if (computerCard !== undefined) {
                    $("#computerCard").attr("src", computerCard.image);
                    $("#btnPauseGame").prop("disabled", false);
                    gameState.lastComputerCard = computerCard;
                    if (!gameState.firstCard) {
                        $("#playerCard").click(playCard);
                        $("#playerCard").addClass("clickable");
                        gameState.firstCard = true;
                    }
                }
            });
    }
}

function playCard() {
    gameState.score += match(gameState.lastPlayerCard, gameState.lastComputerCard);
    $("#score").html(gameState.score);

    $("#discardCard").attr("src", gameState.lastPlayerCard.image);

    drawPlayerCard();
    drawComputerCard();
}

function showScoreBoard() {
    let scores = JSON.parse(localStorage.getItem("scores"));
    if (scores !== null) {
        scores.sort(SortByName);
        let tableRef = $("#scoreBoard tbody");
        tableRef.empty();
        scores.forEach(
            function (score) {
                tableRef.append("<tr><td>" +
                    score.name +
                    "</td><td>" +
                    score.date +
                    "</td><td>" +
                    score.score +
                    "</td><td>" +
                    formatTime(score.time) +
                    "</td></tr>");
            }
        );
    }
}

function SortByName(a, b) {
    return ((a.score < b.score) ? 1 : ((a.score > b.score) ? -1 : 0));
}

function match(card1, card2) {
    if (card1.code.slice(0, 1) === card2.code.slice(0, 1))
        return 1;
    if (card1.code.slice(1, 2) === card2.code.slice(1, 2))
        return 1;
    return -1;
}

function setTime() {
    if (!gameState.isPaused) {
        gameState.time++;
        $("#seconds").html(pad(gameState.time % 60));
        $("#minutes").html(pad(parseInt(gameState.time / 60)));
    }
}

function formatTime(time) {
    return pad(parseInt(time / 60)) + ":" + pad(time % 60);
}

function pad(val) {
    let valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

function getDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;

    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = "0" + dd;
    }
    if (mm < 10) {
        mm = "0" + mm;
    }
    today = yyyy + "/" + mm + "/" + dd;
    return today;
}