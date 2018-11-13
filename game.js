let deck;
let dealtCards;
let playerCards;
let computerCards;
let interval;
let lastCard = "none";

let gameState = {
    score: null,
    totalSeconds: null,
    isPaused: false
};

document.getElementById("newGame").addEventListener("click", newGame);
document.getElementById("pauseGame").addEventListener("click", pauseGame);
document.getElementById("saveGame").addEventListener("click", saveGame);

document.getElementById("saveGame").disabled = true;
document.getElementById("pauseGame").disabled = true;

showScoreBoard();

function showScoreBoard() {
    let rows = document.getElementById('scoreBoard').getElementsByTagName('tbody')[0].rows.length;
    if (rows === 0)
        document.getElementById('scoreBoard').style.visibility = "hidden";
    else
        document.getElementById('scoreBoard').style.visibility = "visible";
}

function newGame() {
    gameState.score = 0;
    gameState.totalSeconds = 0;

    document.getElementById("seconds").innerHTML = "00";
    document.getElementById("minutes").innerHTML = "00";
        
    document.getElementById("saveGame").disabled = true;
    document.getElementById("pauseGame").disabled = false;

    document.getElementById("deckCard").src = "images/red_back.png";
    document.getElementById("playerCard").src = "images/none.png";
    document.getElementById("computerCard").src = "images/none.png";
    document.getElementById("discardCard").src = "images/none.png";

    document.getElementById("newGame").innerHTML = "Draw";
    document.getElementById("newGame").removeEventListener("click", newGame);
    document.getElementById("newGame").addEventListener("click", drawCard);

    deck = getDeck();

    dealtCards = dealCards(deck);

    playerCards = dealtCards.playerCards;
    computerCards = dealtCards.computerCards;
    interval = setInterval(setTime, 1000);
}

function pauseGame() {
    gameState.isPaused = true;
    document.getElementById("newGame").disabled = true;
    document.getElementById("pauseGame").innerHTML = "Start";
    document.getElementById("pauseGame").removeEventListener("click", pauseGame);
    document.getElementById("pauseGame").addEventListener("click", startGame);
}

function startGame() {
    gameState.isPaused = false;
    document.getElementById("newGame").disabled = false;
    document.getElementById("pauseGame").innerHTML = "Pause";
    document.getElementById("pauseGame").removeEventListener("click", startGame);
    document.getElementById("pauseGame").addEventListener("click", pauseGame);
}

function saveGame() {
    let name = prompt("Please enter a name:");

    if (name !== null) {
        let tableRef = document.getElementById('scoreBoard').getElementsByTagName('tbody')[0];
        let newRow = tableRef.insertRow(tableRef.rows.length);

        let newName = newRow.insertCell(0);
        let nameText = document.createTextNode(name);
        newName.appendChild(nameText);

        let newDate = newRow.insertCell(1);
        let dateText = document.createTextNode(getDate());
        newDate.appendChild(dateText);

        let newScore = newRow.insertCell(2);
        let scoreText = document.createTextNode(gameState.score);
        newScore.appendChild(scoreText);

        let newTime = newRow.insertCell(3);
        let timeText = document.createTextNode(gameState.totalSeconds);
        newTime.appendChild(timeText);

        showScoreBoard();
    }
    document.getElementById("saveGame").disabled = true;
}

function drawCard() {
    if (playerCards.length > 0) {
        document.getElementById("discardCard").src = "images/" + lastCard + ".png";
        let playerCard = draw(playerCards);
        let computerCard = draw(computerCards);
        lastCard = playerCard.toString;

        document.getElementById("playerCard").src = "images/" + playerCard.toString + ".png";

        document.getElementById("computerCard").src = "images/loading.gif";
        document.getElementById("newGame").disabled = true;
        document.getElementById("pauseGame").disabled = true;
        window.setTimeout(
            function () {
                document.getElementById("computerCard").src = "images/" + computerCard.toString + ".png";
                gameState.score += match(playerCard, computerCard);
                document.getElementById('score').innerHTML = gameState.score;
                document.getElementById("newGame").disabled = false;
                document.getElementById("pauseGame").disabled = false;
            }, Math.floor(Math.random() * 3000));

    } else {
        clearInterval(interval);
        document.getElementById("deckCard").src = "images/none.png";

        document.getElementById("pauseGame").disabled = true;

        document.getElementById("newGame").innerHTML = "New Game";
        document.getElementById("newGame").removeEventListener("click", drawCard);
        document.getElementById("newGame").addEventListener("click", newGame);
        if (gameState.score > 0) {
            alert("You won! Your score was: " + gameState.score);
        } else {
            alert("You lost! Your score was: " + gameState.score);
        }
        document.getElementById("saveGame").disabled = false;
    }
}

function setTime() {
    if (!gameState.isPaused) {
        gameState.totalSeconds++;
        document.getElementById("seconds").innerHTML = pad(gameState.totalSeconds % 60);
        document.getElementById("minutes").innerHTML = pad(parseInt(gameState.totalSeconds / 60));
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
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = yyyy + '/' + mm + '/' + dd;
    return today;
}