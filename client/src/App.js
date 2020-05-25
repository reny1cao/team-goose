import React, { useReducer } from "react";
import { MuiThemeProvider } from "@material-ui/core";
import { BrowserRouter, Route } from "react-router-dom";

import { theme } from "./themes/theme";
import LandingPage from "./pages/Landing";
import CreateGame from "./pages/create_game/CreateGame";
import GameIO from "./socket_io/GameIO";
import GameLobby from "./pages/game_lobby/GameLobby";

import "./App.css";

export const AppContext = React.createContext({});

function App() {
  const [gameIOState, gameIODispatch] = useReducer(
    GameIO.reducer,
    GameIO.initialState
  );
  const value = { gameIO: { state: gameIOState, dispatch: gameIODispatch } };

  return (
    <AppContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <Route exact path="/" component={LandingPage} />
          <Route path="/create_game" component={CreateGame} />
          <Route path="/game_lobby" component={GameLobby} />
        </BrowserRouter>
      </MuiThemeProvider>
    </AppContext.Provider>
  );
}

export default App;
