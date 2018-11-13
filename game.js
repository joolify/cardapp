var deck;
var dealtCards;
var playerCards;
var computerCards;
var score;
var totalSeconds;
var interval;
var isPaused = false;
var lastCard = "none";

document.getElementById("newGame").addEventListener("click", newGame);
document.getElementById("pauseGame").addEventListener("click", pauseGame);
document.getElementById("saveGame").addEventListener("click", saveGame);

document.getElementById("saveGame").disabled = true;
document.getElementById("pauseGame").disabled = true;

function newGame() {
    totalSeconds = 0;
    score = 0;
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
    isPaused = true;
    document.getElementById("newGame").disabled = true;
    document.getElementById("pauseGame").innerHTML = "Start";
    document.getElementById("pauseGame").removeEventListener("click", pauseGame);
    document.getElementById("pauseGame").addEventListener("click", startGame);
}

function startGame() {
    isPaused = false;
    document.getElementById("newGame").disabled = false;
    document.getElementById("pauseGame").innerHTML = "Pause";
    document.getElementById("pauseGame").removeEventListener("click", startGame);
    document.getElementById("pauseGame").addEventListener("click", pauseGame);
}

function saveGame() {
    var tableRef = document.getElementById('scoreBoard').getElementsByTagName('tbody')[0];
    var newRow = tableRef.insertRow(tableRef.rows.length);

    var newName = newRow.insertCell(0);
    var nameText = document.createTextNode("Joel");
    newName.appendChild(nameText);

    var newDate = newRow.insertCell(1);
    var dateText = document.createTextNode(getDate());
    newDate.appendChild(dateText);

    var newScore = newRow.insertCell(2);
    var scoreText = document.createTextNode(score);
    newScore.appendChild(scoreText);

    var newTime = newRow.insertCell(3);
    var timeText = document.createTextNode(totalSeconds);
    newTime.appendChild(timeText);

    document.getElementById("saveGame").disabled = true;

}

function drawCard() {
    if (playerCards.length > 0) {
        document.getElementById("discardCard").src = "images/" + lastCard + ".png";
        var playerCard = draw(playerCards);
        var computerCard = draw(computerCards);
        lastCard = playerCard.toString;

        document.getElementById("playerCard").src = "images/" + playerCard.toString + ".png";
        document.getElementById("computerCard").src = "images/" + computerCard.toString + ".png";
        console.log(playerCard.suit + ", " + playerCard.value);

        score += match(playerCard, computerCard);

        document.getElementById('score').innerHTML = score;

    } else {
        clearInterval(interval);
        document.getElementById("deckCard").src = "images/none.png";

        document.getElementById("pauseGame").disabled = true;

        document.getElementById("newGame").innerHTML = "New Game";
        document.getElementById("newGame").removeEventListener("click", drawCard);
        document.getElementById("newGame").addEventListener("click", newGame);
        if (score > 0) {
            alert("You won! Your score was: " + score);
        } else {
            alert("You lost! Your score was: " + score);
        }
        document.getElementById("saveGame").disabled = false;
    }
}

function setTime() {
    if (!isPaused) {
        ++totalSeconds;
        document.getElementById("seconds").innerHTML = pad(totalSeconds % 60);
        document.getElementById("minutes").innerHTML = pad(parseInt(totalSeconds / 60));
    }
}

function pad(val) {
    var valString = val + "";
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
    var indexToSplit = deck.length / 2;
    var first = deck.slice(0, indexToSplit);
    var second = deck.slice(indexToSplit);

    return { playerCards: first, computerCards: second };
}

function shuffle(deck) {
    for (var i = 0; i < 1000; i++) {
        var location1 = Math.floor((Math.random() * deck.length));
        var location2 = Math.floor((Math.random() * deck.length));
        var tmp = deck[location1];

        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
}
function getDeck() {
    var deck = new Array();
    var suits = ["S", "D", "C", "H"];
    var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"];

    for (var i = 0; i < suits.length; i++) {
        for (var x = 0; x < values.length; x++) {
            var card = { value: values[x], suit: suits[i], toString: values[x] + suits[i] };
            deck.push(card);
        }
    }

    shuffle(deck);

    return deck;
}

function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = yyyy + '/' + mm + '/' + dd;
    return today;
}