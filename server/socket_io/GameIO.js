const NAMESPACE = "/game";
const MatchManager = require("../manager/MatchManager");

let connection = null;
let countdown = 30;

class GameIO {
  constructor() {
    this.gameIO = null;
  }

  connect(io) {
    this.gameIO = io.of(NAMESPACE);

    this.gameIO.on("connection", (socket) => {
      console.log(`New client connected from the game: ${socket.id}`);

      socket.on("join game", (matchId) => {
        const message = MatchManager.joinMatch(matchId);
        socket.emit("resolve join game", message);
      });

      socket.on("disconnect", () => {
        console.log(`A client disconnected from the game: ${socket.id}`);
      });

      socket.on("create game", (hostId) => {
        const match = MatchManager.createMatch(hostId);
        socket.emit("resolve create game", match);
      });

      socket.on("game start", (matchId, user) => {
        const match = MatchManager.getMatch(matchId);
        const redTeam = match.getRedTeam();
        const blueTeam = match.getBlueTeam();
        const players = [...redTeam, ...blueTeam];
        let player = players.find((player) => player.user.id === user.id);
        if (!player) {
          player = { team: "", role: "", user };
        }
        socket.emit("resolve start game", player);
      });

      socket.on("game state onload", (matchId) => {
        socket.join(matchId);
        const match = MatchManager.getMatch(matchId);
        socket.emit("game state change", match.getGameState());
      });

      // setInterval(() => {
      //   countdown--;
      //   this.gameIO.to(matchId).emit("timer", { countdown: countdown });
      // }, 1000);

      socket.on("end turn", (matchId) => {
        const match = MatchManager.getMatch(matchId);
        match.nextGameTurn();
        socket.emit("game state change", match.getGameState());
      });

      socket.on("card select", (matchId, data) => {
        const match = MatchManager.getMatch(matchId);
        match.vote(data);
        this.gameIO.to(matchId).emit("game state change", match.getGameState());
      });

      socket.on("send max allowed guesses", (matchId, numOfGuesses) => {
        const match = MatchManager.getMatch(matchId);
        match.giveHint(numOfGuesses);
        match.nextGameTurn();
        this.gameIO.to(matchId).emit("game state change", match.getGameState());
      });

      socket.on("lobby role change", (matchId, redTeam, blueTeam) => {
        const match = MatchManager.getMatch(matchId);
        match.setRedTeam(redTeam);
        match.setBlueTeam(blueTeam);
        socket
          .to(matchId)
          .emit(
            "resolve lobby role change",
            match.getRedTeam(),
            match.getBlueTeam()
          );
      });

      socket.on("game lobby onload", (matchId) => {
        const match = MatchManager.getMatch(matchId);
        socket.join(matchId);
        const redTeam = match.getRedTeam();
        const blueTeam = match.getBlueTeam();
        socket.emit("resolve game lobby onload", redTeam, blueTeam);
      });
    });
  }

  static init(io) {
    if (!connection) {
      connection = new GameIO();
      connection.connect(io);
    }
  }

  // use this to get a reference to the io pointing to the "/game" namespace. To be used by the game engine/managers.
  static getConnection() {
    if (!connection) {
      throw new Error("No active connection");
    }
    return connection;
  }
}

module.exports = {
  connect: GameIO.init,
  connection: GameIO.getConnection,
};
