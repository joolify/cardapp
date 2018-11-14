let gameState = {
    score: null,
    time: null,
    isPaused: false,
    playerCards: null,
    computerCards: null,
    lastCard: "none",
    timer: null
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

    $("#saveGame").prop("disabled", true);
    $("#pauseGame").prop("disabled", false);

    $("#deckCard").attr("src", "images/red_back.png");
    $("#playerCard").attr("src", "images/none.png");
    $("#computerCard").attr("src", "images/none.png");
    $("#discardCard").attr("src", "images/none.png");

    $("#newGame").html("Draw");
    $("#newGame").off("click");
    $("#newGame").click(drawCard);

    let deck = getDeck();

    let dealtCards = dealCards(deck);

    gameState.playerCards = dealtCards.playerCards;
    gameState.computerCards = dealtCards.computerCards;
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
    if (gameState.playerCards.length > 0) {
        $("#discardCard").attr("src", "images/" + gameState.lastCard + ".png");
        let playerCard = draw(gameState.playerCards);
        let computerCard = draw(gameState.computerCards);
        gameState.lastCard = playerCard.toString;

        $("#playerCard").attr("src", "images/" + playerCard.toString + ".png");

        $("#computerCard").attr("src", "images/loading.gif");
        $("#newGame").prop("disabled", true);
        $("#pauseGame").prop("disabled", true);
        window.setTimeout(
            function () {
                $("#computerCard").attr("src", "images/" + computerCard.toString + ".png");
                gameState.score += match(playerCard, computerCard);
                $("#score").html(gameState.score);
                $("#newGame").prop("disabled", false);
                $("#pauseGame").prop("disabled", false);
            }, Math.floor(Math.random() * 3000));

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

function draw(deck) {
    return deck.pop();
}

function match(card1, card2) {
    if (card1.value === card2.value)
        return 1;
    if (card1.suit === card2.suit)
        return 1;
    return -1;
}
function dealCards(deck) {
    let indexToSplit = deck.length / 2;
    let first = deck.slice(0, indexToSplit);
    let second = deck.slice(indexToSplit);

    return { playerCards: first, computerCards: second };
}

function shuffle(deck) {
    for (let i = 0; i < 1000; i++) {
        let location1 = Math.floor((Math.random() * deck.length));
        let location2 = Math.floor((Math.random() * deck.length));
        let tmp = deck[location1];

        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
}
function getDeck() {
    let deck = new Array();
    let suits = ["S", "D", "C", "H"];
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"];

    for (let i = 0; i < suits.length; i++) {
        for (let x = 0; x < values.length; x++) {
            let card = { value: values[x], suit: suits[i], toString: values[x] + suits[i] };
            deck.push(card);
        }
    }

    shuffle(deck);

    return deck;
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