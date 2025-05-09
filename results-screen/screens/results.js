import { navigateTo, socket } from "../app.js";

export default function renderScreenResults() {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1">
        <h2>Jugadores conectados</h2>
        <ul id="players"></ul>
      </div>
      `;
  socket.on("userJoined", (gameData) => {
   
    const playersList = document.getElementById("players");
    playersList.innerHTML = ""; 

    gameData.players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = `${player.nickname} : ${player.score || 0} pts`;
      playersList.appendChild(li);
    });
  });

  socket.on("scoreUpdated", (gameData) => {
    const playersList = document.getElementById("players");
    playersList.innerHTML = "";

    gameData.players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = `${player.nickname} : ${player.score || 0} pts`;
      playersList.appendChild(li);
    });
  });

  socket.on("gameWinner",  (data) => { 
    console.log("gameWinner received:", data); 
    navigateTo("/winner", data)
  })
}