import React, { useState, useEffect, useContext } from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import { AppContext } from "../../App";
import { useGameState } from "../../socket_io/GameIO";
import { TEAM_ROLE } from "../game_lobby/team_select/TeamPresets";
import GamePrompt from "./GamePrompt";
import GameBoard from "./GameBoard";
import EndGamePopUp from "./EndGamePopUp";
import Chat from "../chat/Chat";
import "./Game.css";

function Game(props) {
  const { match, gameIO } = useContext(AppContext);
  const [matchId] = useState(
    props.location.state ? props.location.state.matchId : ""
  );
  const gameState = useGameState(gameIO.state.io, matchId);
  const [player] = useState(
    props.location.state ? props.location.state.player : null
  );

  useEffect(() => {
    if (!matchId || !player) {
      props.history.push({ pathname: "/" });
    }
    let updatedMatch = { hasStarted: true };
    updatedMatch = { ...match.state.match, ...updatedMatch };
    match.state.setMatch(updatedMatch);
    // eslint-disable-next-line
  }, []);

  const endTurn = () => {
    gameIO.state.io.emit("end turn", matchId);
    console.log("end turn");
  };

  return (
    <>
      {gameState ? (
        <Container>
          <Grid container justify="space-evenly">
            <Grid item xs>
              <Chat matchId={matchId} player={player} />
            </Grid>
            <Grid item xs={9} className="game-panel">
              <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={4}
              >
                <Grid item className="game-prompt">
                  <GamePrompt gameState={gameState} player={player} />
                </Grid>
                <Grid item>
                  <GameBoard
                    gameState={gameState}
                    player={player}
                    matchId={matchId}
                  />
                </Grid>
                <Grid item>
                  {player.role === TEAM_ROLE.FIELD_AGENT &&
                  player.team === gameState.gameTurn.team &&
                  gameState.gameTurn.role !== TEAM_ROLE.SPYMASTER ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={endTurn}
                    >
                      End Turn
                    </Button>
                  ) : null}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {gameState.winner ? (
            <EndGamePopUp
              gameState={gameState}
              gameIO={gameIO}
              matchId={matchId}
            />
          ) : null}
        </Container>
      ) : null}
    </>
  );
}

export default Game;
