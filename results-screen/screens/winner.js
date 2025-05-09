import { makeRequest, navigateTo, socket } from "../app.js";

export default function renderScreenWinner(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div id="screen2">
          <h1>Resultados Finales</h1>
          <h3 id="msg"></h3>
          <h2>Ranking de jugadores:</h2>
          <ul id="all-players"></ul>
          <button id="go-abc-players">Ordenar alfábeticamente</button>
          <button id="reset-btn">Reiniciar Juego</button>
        </div>
        `;

      const message = document.getElementById("msg")
      const playersList = document.getElementById("all-players")
      const sortButton = document.getElementById("go-abc-players");
      const resetButton = document.getElementById("reset-btn");

      let currentRanking = [...data.ranking];

      message.textContent = data.message

      function renderRanking(ranking) {
        playersList.innerHTML = ""; // limpia la lista
        ranking.forEach((player) => {
          const li = document.createElement("li");
    
          let medal = "";
          if (player.position === 1) medal = "🥇";
          else if (player.position === 2) medal = "🥈";
          else if (player.position === 3) medal = "🥉";
    
          li.textContent = `${medal} ${player.position}. ${player.nickname} : ${player.score} puntos`;
          playersList.appendChild(li);
        });
      }
      // Renderiza el ranking inicial

      if (currentRanking.length) {
        renderRanking(currentRanking);
      } else {
        sortButton.disabled = true;
      }
    
    
      // Ordenar alfabéticamente al hacer clic
      sortButton.addEventListener("click", () => {
        const sortedRanking = [...data.ranking].sort((a, b) =>
          a.nickname.localeCompare(b.nickname)
        );
    
        // Actualiza posiciones para mostrar bien en la lista
        sortedRanking.forEach((player, index) => {
          player.position = index + 1;
        });
    
        renderRanking(sortedRanking);
      });
    

      resetButton.addEventListener("click", async () => {
        await makeRequest("/api/game/reset-game", "POST");
        navigateTo("/"); 
      });
}
