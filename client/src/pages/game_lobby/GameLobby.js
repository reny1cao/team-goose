import React, { useState, useEffect, useContext } from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { copyToClipboard } from "../../utils/utils";
import { useUser } from "../../contexts/user";
import Header from "../common/Header";
import TeamSelect from "./team_select/TeamSelect";

import { AppContext } from "../../App";
import { useMatchId } from "../../socket_io/GameIO";
import "../common/common.css";
import "./GameLobby.css";

const SPYMASTER_INDEX = 0;
const FIELD_AGENT_INDEX = 1;

function GameLobby(props) {
  const { user } = useUser();
  const { gameIO } = useContext(AppContext);
  const [matchId, setMatchId] = useState(props.location.state.matchId);
  //const [matchId, setMatchId] = useMatchId();
  const [canStartGame, setCanStartGame] = useState(false);
  const [redTeam, setRedTeam] = useState(null);
  const [blueTeam, setBlueTeam] = useState(null);

  useEffect(() => {
    const matchIdStr = props.location.state
      ? props.location.state.matchId
      : null;
    if (matchIdStr) {
      setMatchId(matchIdStr);
    } else {
      props.history.push({ pathname: "/" });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    gameIO.state.io.emit("game lobby onload", matchId);
    gameIO.state.io.on("resolve game lobby onload", (redTeam, blueTeam) => {
      setRedTeam(redTeam);
      setBlueTeam(blueTeam);
    });
    // eslint-disable-next-line
  }, []);

  const isTeamReady = (team) => {
    const spyMaster = team[SPYMASTER_INDEX];
    const fieldAgents = team.slice(FIELD_AGENT_INDEX);

    return spyMaster.user && fieldAgents.some((agent) => agent.user);
  };

  const onRoleChange = (redTeam, blueTeam) => {
    const isRedTeamReady = isTeamReady(redTeam);
    const isBlueTeamReady = isTeamReady(blueTeam);
    setCanStartGame(isRedTeamReady && isBlueTeamReady);
  };

  const startGame = () => {
    if (canStartGame) {
      gameIO.state.io.emit("game start", matchId, user);
      gameIO.state.io.on("resolve start game", (player) => {
        props.history.push({
          pathname: "/game",
          state: { matchId, player },
        });
      });
    }
  };

  return (
    <>
      {redTeam && blueTeam ? (
        <Container>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item className="header">
              <Header title="New Game" />
            </Grid>
            <Grid item>
              <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <TeamSelect
                    matchId={matchId}
                    redTeamData={redTeam}
                    blueTeamData={blueTeam}
                    currentUser={user}
                    onRoleChange={onRoleChange}
                  />
                </Grid>
                <Grid item>
                  <Button
                    onClick={() => startGame()}
                    disabled={!canStartGame}
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Start Game
                  </Button>
                </Grid>
                <Grid item>
                  <Grid container justify="center" alignItems="center">
                    <Grid className="label" item>
                      <Typography>Share Match ID:</Typography>
                    </Grid>
                    <Grid item>
                      <Button
                        onClick={() => {
                          copyToClipboard(matchId);
                        }}
                        variant="outlined"
                        color="default"
                        size="small"
                      >
                        Copy
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      ) : null}
    </>
  );
}

export default GameLobby;
