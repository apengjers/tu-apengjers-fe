import React from "react";
import { motion } from "framer-motion";

const gameList = [
  {
    name: "Mobile Legends",
    image: "/assets/mlbb.jpg", // pastikan path benar
    description: "Top up Diamonds MLBB langsung masuk!",
  },
  {
    name: "Free Fire",
    image: "/assets/freefire.jpg",
    description: "Isi diamond FF kamu lebih hemat.",
  },
  {
    name: "PUBG Mobile",
    image: "/assets/pubgm.jpg",
    description: "Top up UC PUBG aman dan cepat.",
  },
  {
    name: "Mobile Legends",
    image: "/assets/mlbb.jpg", // pastikan path benar
    description: "Top up Diamonds MLBB langsung masuk!",
  },
  {
    name: "Free Fire",
    image: "/assets/freefire.jpg",
    description: "Isi diamond FF kamu lebih hemat.",
  },
  {
    name: "PUBG Mobile",
    image: "/assets/pubgm.jpg",
    description: "Top up UC PUBG aman dan cepat.",
  },
  {
    name: "Mobile Legends",
    image: "/assets/mlbb.jpg", // pastikan path benar
    description: "Top up Diamonds MLBB langsung masuk!",
  },
  {
    name: "Free Fire",
    image: "/assets/freefire.jpg",
    description: "Isi diamond FF kamu lebih hemat.",
  },
  {
    name: "PUBG Mobile",
    image: "/assets/pubgm.jpg",
    description: "Top up UC PUBG aman dan cepat.",
  },
];

export default function GamePage() {
  return (
    <div className="p-4 md:p-8 bg-[#f0f4ff] min-h-screen">
      <motion.h1
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-6"
      >
        Top Up Game Populer
      </motion.h1>

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      >
        {gameList.map((game, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl bg-white shadow-md overflow-hidden transition"
          >
            <img
              src={game.image}
              alt={game.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{game.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{game.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
