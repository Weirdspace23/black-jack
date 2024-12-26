import { NextResponse } from "next/server";

const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

let deck = [];
let playerHand = [];
let dealerHand = [];
let balance = 1000;
let currentBet = 0;

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push(value + suit);
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCard() {
  return deck.pop();
}

function calculateScore(hand) {
  let score = 0;
  let aceCount = 0;
  for (let card of hand) {
    const value = card.slice(0, -1);
    if (value === "A") {
      aceCount++;
      score += 11;
    } else if (["K", "Q", "J"].includes(value)) {
      score += 10;
    } else {
      score += parseInt(value);
    }
  }
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }
  return score;
}

function determineWinner() {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  if (playerScore > 21) {
    balance -= currentBet;
    return "You bust! Dealer wins.";
  }
  if (dealerScore > 21) {
    balance += currentBet;
    return "Dealer busts! You win!";
  }
  if (playerScore > dealerScore) {
    balance += currentBet;
    return "You win!";
  }
  if (dealerScore > playerScore) {
    balance -= currentBet;
    return "Dealer wins!";
  }
  return "It's a tie!";
}

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const action = pathname.split("/").pop();

  if (action === "start") {
    const body = await request.json();
    currentBet = body.bet || 10;
  }

  switch (action) {
    case "start":
      createDeck();
      shuffleDeck();
      playerHand = [dealCard(), dealCard()];
      dealerHand = [dealCard(), dealCard()];
      break;
    case "hit":
      playerHand.push(dealCard());
      break;
    case "stand":
      while (calculateScore(dealerHand) < 17) {
        dealerHand.push(dealCard());
      }
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);
  const gameOver = action === "stand" || playerScore >= 21;

  const gameState = {
    playerHand,
    dealerHand: gameOver ? dealerHand : [dealerHand[0], "🂠"],
    playerScore,
    dealerScore: gameOver ? dealerScore : calculateScore([dealerHand[0]]),
    gameOver,
    message: gameOver ? determineWinner() : "",
    bet: currentBet,
    balance,
  };

  return NextResponse.json(gameState);
}
