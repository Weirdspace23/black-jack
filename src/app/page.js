"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateY: 180 },
  visible: { opacity: 1, scale: 1, rotateY: 0 },
};

const PlayingCard = ({ card, index, isDealer }) => (
  <motion.div
    className="bg-white rounded-lg shadow-lg w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold border-2 border-gray-300"
    style={{
      color: ["♥", "♦"].includes(card.slice(-1)) ? "red" : "black",
    }}
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: index * 0.2 }}
  >
    {isDealer && index === 1 && card === "🂠" ? "?" : card}
  </motion.div>
);

export default function BlackjackGame() {
  const [gameState, setGameState] = useState(null);
  const [betAmount, setBetAmount] = useState(10);

  const startNewGame = useCallback(async () => {
    const res = await fetch("/api/blackjack/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bet: betAmount }),
    });
    const newGameState = await res.json();
    setGameState(newGameState);
  }, [betAmount, setGameState]);

  const hit = async () => {
    const res = await fetch("/api/blackjack/hit", { method: "POST" });
    const newGameState = await res.json();
    setGameState(newGameState);
  };

  const stand = async () => {
    const res = await fetch("/api/blackjack/stand", { method: "POST" });
    const newGameState = await res.json();
    setGameState(newGameState);
  };

  const changeBet = (amount) => {
    setBetAmount((prev) =>
      Math.max(1, Math.min(prev + amount, gameState?.balance || 100))
    );
  };

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  if (!gameState)
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 md:p-8 bg-green-700 rounded-xl shadow-2xl border-4 border-yellow-500">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-yellow-400 shadow-text">
          Blackjack
        </h1>

        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="font-semibold text-lg sm:text-xl mb-2 text-white">
            Dealer&apos;s Hand:{" "}
            {gameState.gameOver ? gameState.dealerScore : "?"}
          </h2>
          <div className="flex gap-2 justify-center flex-wrap">
            <AnimatePresence>
              {gameState.dealerHand.map((card, index) => (
                <PlayingCard
                  key={index}
                  card={card}
                  index={index}
                  isDealer={true}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="font-semibold text-lg sm:text-xl mb-2 text-white">
            Your Hand: {gameState.playerScore}
          </h2>
          <div className="flex gap-2 justify-center flex-wrap">
            <AnimatePresence>
              {gameState.playerHand.map((card, index) => (
                <PlayingCard
                  key={index}
                  card={card}
                  index={index}
                  isDealer={false}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-4 sm:mb-6">
          <Button
            onClick={hit}
            disabled={gameState.gameOver}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Hit
          </Button>
          <Button
            onClick={stand}
            disabled={gameState.gameOver}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Stand
          </Button>
        </div>

        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="text-white">
            <p>Balance: ${gameState.balance}</p>
            <p>Current Bet: ${gameState.bet}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => changeBet(-5)}
              disabled={gameState.gameOver || betAmount <= 5}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
            >
              -5
            </Button>
            <Button
              onClick={() => changeBet(5)}
              disabled={gameState.gameOver || betAmount >= gameState.balance}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
            >
              +5
            </Button>
          </div>
        </div>

        {gameState.gameOver && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-bold text-xl sm:text-2xl mb-4 text-yellow-300">
              {gameState.message}
            </p>
            <Button
              onClick={startNewGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition duration-200"
            >
              New Game
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
