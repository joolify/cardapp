let gameState = {
    score: null,
    time: null,
    isPaused: false,
    remaining: null,
    lastCard: "none",
    timer: null,
    deckid: null
};

$(function () {
    $("#newGame").click(newGame);
    $("#pauseGame").click(pauseGame);
    $("#saveGame").click(saveGame);

    $("#saveGame").prop("disabled", true);
    $("#pauseGame").prop("disabled", true);

    initScoreBoard();
    showScoreBoard();
});

function initScoreBoard() {
    let scores = JSON.parse(localStorage.getItem("scores"));
    if (scores !== null) {
        let tableRef = $("#scoreBoard tbody");
        scores.forEach(
            function (score) {

                tableRef.append("<tr><td>" +
                    score.name +
                    "</td><td>" +
                    score.date +
                    "</td><td>" +
                    score.score +
                    "</td><td>" +
                    score.time +
                    "</td></tr>");
            }
        );
    }
}
function showScoreBoard() {
    let rows = $("#scoreBoard >tbody >tr").length;
    if (rows === 0)
        $("#scoreBoard").hide();
    else
        $("#scoreBoard").show();
}

function newGame() {
    gameState.score = 0;
    gameState.time = 0;

    $("#seconds").html("00");
    $("#minutes").html("00");

    $("#newGame").prop("disabled", true);
    $("#saveGame").prop("disabled", true);
    $("#pauseGame").prop("disabled", false);

    $("#deckCard").attr("src", "images/red_back.png");
    $("#playerCard").attr("src", "images/none.png");
    $("#computerCard").attr("src", "images/none.png");
    $("#discardCard").attr("src", "images/none.png");

    $.getJSON("https://deckofcardsapi.com/api/deck/new/shuffle/")
        .done(function (data) {
            gameState.deckid = data.deck_id;
            gameState.remaining = data.remaining;
            $("#newGame").prop("disabled", false);
            $("#newGame").html("Draw");
            $("#newGame").off("click");
            $("#newGame").click(drawCard);
        });

    /*
    let deck = getDeck();
    let dealtCards = dealCards(deck);

    gameState.playerCards = dealtCards.playerCards;
    gameState.computerCards = dealtCards.computerCards;
    */
    gameState.timer = setInterval(setTime, 1000);
}

function pauseGame() {
    gameState.isPaused = true;
    $("#newGame").prop("disabled", true);
    $("#pauseGame").html("Start");
    $("#pauseGame").off("click");
    $("#pauseGame").click(startGame);
}

function startGame() {
    gameState.isPaused = false;
    $("#newGame").prop("disabled", false);
    $("#pauseGame").html("Pause");
    $("#pauseGame").off("click");
    $("#pauseGame").click(pauseGame);
}

function saveGame() {
    let name = prompt("Please enter a name:");

    if (name !== null) {
        let tableRef = $("#scoreBoard tbody");
        let nowDate = getDate();
        tableRef.append("<tr><td>" +
            name +
            "</td><td>" +
            nowDate +
            "</td><td>" +
            gameState.score +
            "</td><td>" +
            gameState.time +
            "</td></tr>");

        let scoreObj = {
            name: name,
            date: nowDate,
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

        showScoreBoard();
    }
    $("#saveGame").prop("disabled", true);
}

function drawCard() {
    if (gameState.remaining > 0) {
        $("#discardCard").attr("src", gameState.lastCard.image);

        drawCards();

    } else {
        clearInterval(gameState.timer);
        $("#deckCard").attr("src", "images/none.png");

        $("#pauseGame").prop("disabled", true);

        $("#newGame").html("New Game");
        $("#newGame").off("click");
        $("#newGame").click(newGame);

        if (gameState.score > 0) {
            alert("You won! Your score was: " + gameState.score);
        } else {
            alert("You lost! Your score was: " + gameState.score);
        }
        $("#saveGame").prop("disabled", false);
    }
}

function drawCards() {
    $("#playerCard").attr("src", "images/loading.gif");
    $.getJSON("https://deckofcardsapi.com/api/deck/" + gameState.deckid + "/draw/", { count: 1 })
        .done(function (deck) {
            let playerCard = drawPlayerCard(deck);

            $("#computerCard").attr("src", "images/loading.gif");
            $("#newGame").prop("disabled", true);
            $("#pauseGame").prop("disabled", true);

            window.setTimeout(
                function () {
                    drawComputerCard(playerCard);
                }, Math.floor(Math.random() * 3000));
        });
}

function drawPlayerCard(deck) {
    gameState.remaining = deck.remaining;
    let playerCard = deck.cards[0];
    $("#playerCard").attr("src", playerCard.image);
    gameState.lastCard = playerCard;
    return playerCard;
}

function drawComputerCard(playerCard) {
    $.getJSON("https://deckofcardsapi.com/api/deck/" + gameState.deckid + "/draw/", { count: 1 })
        .done(function (deck) {
            gameState.remaining = deck.remaining;
            let computerCard = deck.cards[0];
            $("#computerCard").attr("src", computerCard.image);
            gameState.score += match(playerCard, computerCard);
            $("#score").html(gameState.score);
            $("#newGame").prop("disabled", false);
            $("#pauseGame").prop("disabled", false);
        });
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