"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";

interface GameState {
  playerCount: number;
}

class Game extends React.Component<GameState> {
  constructor(props) {
    super(props);
  }

  render() {
    return [...Array(this.props.playerCount)].map((_, baseZeroPlayerNumber) => (
      <div key={"player-" + baseZeroPlayerNumber}>
        Hello, Player {baseZeroPlayerNumber + 1}!
      </div>
    ));
  }
}

ReactDOM.render(
  React.createElement(Game, { playerCount: 2 }),
  document.querySelector("#cribbage_analyst")
);
