/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { List } from "immutable";

enum Index {
  ACE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  JACK,
  QUEEN,
  KING
}

enum Suit {
  CLUBS,
  DIAMONDS,
  HEARTS,
  SPADES
}

interface Card {
  index: Index;
  suit: Suit;
}

interface DealtHand {
  cards: List<Card>;
}

class DealtHandComponent extends React.Component<DealtHand> {
  render() {
    return this.props.cards
      .map(card => (
        <div key={`${card.index}-${card.suit}`}>
          Index {card.index} - Suit {card.suit}
        </div>
      ))
      .toArray();
  }
}

class Game extends React.Component<DealtHand> {
  constructor(props) {
    super(props);
  }

  render() {
    return <DealtHandComponent cards={this.props.cards}></DealtHandComponent>;
  }
}

ReactDOM.render(
  React.createElement(Game, {
    cards: List.of(
      { index: Index.TWO, suit: Suit.CLUBS },
      { index: Index.THREE, suit: Suit.DIAMONDS },
      { index: Index.FOUR, suit: Suit.HEARTS },
      { index: Index.EIGHT, suit: Suit.SPADES },
      { index: Index.NINE, suit: Suit.CLUBS },
      { index: Index.TEN, suit: Suit.DIAMONDS }
    )
  }),
  document.querySelector("#cribbage_analyst")
);
