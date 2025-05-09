const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);  

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const poloSelected = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();

    if (poloSelected.role === "polo-especial") {
      myUser.score = (myUser.score || 0) + 50;
      poloSelected.score = (poloSelected.score || 0) - 10;
    } else {
      myUser.score = (myUser.score || 0) - 10;

      const poloEspecial = allPlayers.find(p => p.role === "polo-especial");
      if (poloEspecial && poloEspecial.id !== poloSelected.id) {
        poloEspecial.score = (poloEspecial.score || 0) + 10;
        playersDb.updatePlayer(poloEspecial);
      }
    }


    playersDb.updatePlayer(myUser);
    playersDb.updatePlayer(poloSelected);
    emitEvent("scoreUpdated", playersDb.getGameData());

    if (poloSelected.role === "polo-especial") {
      // Notify all players that the game is over
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        });
      });
    } else {
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha perdido`,
        });
      });
    }

    const winner = allPlayers.find((p) => (p.score || 0) >= 100);

    if (winner) {
      console.log("Winner found:", winner.nickname); 
      const rankedPlayers = [...allPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));

      allPlayers.forEach((player) => {
        console.log("Emitiendo evento 'gameWinner' a:", player.id); 
        emitEvent("gameWinner", {
          message: `${winner.nickname} ha ganado el juego con ${winner.score} puntos!`,
          winner: winner.nickname,
          score: winner.score,
          ranking: rankedPlayers.map((p, i) => ({
            nickname: p.nickname,
            score: p.score || 0,
            position: i + 1,
          })),
        });
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetGame = async (req, res) => {
  try {
    playersDb.resetGame();

    emitEvent("resetGame", {}); 

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  resetGame
};
