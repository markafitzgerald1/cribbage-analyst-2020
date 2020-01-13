/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { List } from "immutable";

enum Index {
  Ace,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King
}

const INDEX_STRINGS: List<String> = List(
  "A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",")
);

function indexString(index: Index) {
  return INDEX_STRINGS.get(index);
}

enum Suit {
  Clubs,
  Diamonds,
  Hearts,
  Spades
}

function suitString(suit: Suit) {
  return "♣♦♥♠"[suit];
}

class Card {
  constructor(readonly index: Index, readonly suit: Suit) {}

  toString(): string {
    return `${indexString(this.index)}${suitString(this.suit)}`;
  }
}

interface CardComponentProps {
  card: Card;
}

const BLACK_SUITS: List<Suit> = List.of(Suit.Clubs, Suit.Spades);

class CardComponent extends React.Component<CardComponentProps> {
  render() {
    return (
      <span
        style={{
          border: "solid",
          borderWidth: "0.03em",
          borderColor: "lightGrey",
          padding: "0.05em 0.185em",
          margin: "0.09em",
          backgroundColor: "#f8f8f8",
          color: BLACK_SUITS.contains(this.props.card.suit) ? "black" : "red"
        }}
      >
        {this.props.card.toString()}
      </span>
    );
  }
}

interface DealtHand {
  cards: List<Card>;
}

class DealtHandComponent extends React.Component<DealtHand> {
  render() {
    return this.props.cards
      .map(card => (
        <CardComponent card={card} key={card.toString()}></CardComponent>
      ))
      .toArray();
  }
}

class DealtHandInput extends React.Component<{}, { value: string }> {
  constructor(props) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    console.log(`Input state set to ${event.target.value}.`);
  }

  render() {
    return (
      <div>
        <label>
          Dealt Cards:
          <input
            type="text"
            maxLength={6}
            value={this.state.value}
            onChange={this.handleChange}
          />
        </label>
      </div>
    );
  }
}

class Game extends React.Component<DealtHand> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <DealtHandComponent cards={this.props.cards}></DealtHandComponent>,
        <DealtHandInput></DealtHandInput>
      </div>
    );
  }
}

ReactDOM.render(
  React.createElement(Game, {
    cards: List.of(
      new Card(Index.Two, Suit.Clubs),
      new Card(Index.Three, Suit.Diamonds),
      new Card(Index.Four, Suit.Hearts),
      new Card(Index.Eight, Suit.Spades),
      new Card(Index.Nine, Suit.Clubs),
      new Card(Index.Ten, Suit.Diamonds)
    )
  }),
  document.querySelector("#cribbage_analyst")
);
