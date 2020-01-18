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
  "A,2,3,4,5,6,7,8,9,T,J,Q,K".split(",")
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

const SUIT_STRINGS: List<String> = List("♣♦♥♠");

function suitString(suit: Suit) {
  return SUIT_STRINGS.get(suit);
}

class Card {
  constructor(readonly index: Index, readonly suit?: Suit) {}

  toString(): string {
    return `${indexString(this.index)}${
      typeof this.suit === "undefined" ? "" : suitString(this.suit)
    }`;
  }
}

interface CardComponentProps {
  card: Card;
}

const BLACK_SUITS: List<Suit> = List.of(Suit.Clubs, Suit.Spades);

class CardComponent extends React.Component<CardComponentProps> {
  getColor(suit: Suit): string {
    if (typeof suit === "undefined") {
      return "green";
    }
    if (BLACK_SUITS.contains(suit)) {
      return "black";
    }
    return "red";
  }

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
          color: this.getColor(this.props.card.suit)
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
      .map((card, key) => (
        <CardComponent
          card={card}
          key={`${card.toString()}-${key + 1}`}
        ></CardComponent>
      ))
      .toArray();
  }
}

class DealtHandInput extends React.Component<
  { value: string; onInputChange: (event) => void },
  {}
> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onInputChange(event.target.value);
  }

  render() {
    return (
      <div>
        <label>
          Dealt Cards:
          <input
            type="text"
            value={this.props.value}
            onChange={this.handleChange}
          />
        </label>
      </div>
    );
  }
}

class Game extends React.Component<{}, DealtHand> {
  constructor(props) {
    super(props);
    this.state = { cards: List() };
  }

  handleHandSpecifierChange(handSpecifier: string): void {
    const cardSpecifiers = handSpecifier.match(
      /(A|[2-9]|10?|T|J|Q|K)([C♣D♦H♥S♠])?/gi
    );
    if (!cardSpecifiers) {
      this.setState({ cards: List() });
      return;
    }

    const normalizedCardSpecifiers = cardSpecifiers.map(cardSpecifier =>
      cardSpecifier
        .toUpperCase()
        .replace(/^10?/, "T")
        .replace(/C$/, "♣")
        .replace(/D$/, "♦")
        .replace(/H$/, "♥")
        .replace(/S$/, "♠")
    );

    const newCards: List<Card> = List.of(
      ...normalizedCardSpecifiers
        .map(normalizedCardSpecifier =>
          normalizedCardSpecifier.match(/([A2-9TJQK])([♣♦♥♠]?)/)
        )
        .map(
          ([all, index, suit]) =>
            new Card(
              INDEX_STRINGS.indexOf(index),
              suit ? SUIT_STRINGS.indexOf(suit) : undefined
            )
        )
    );

    this.setState({
      cards: newCards
    });
  }

  render() {
    return (
      <div>
        <DealtHandComponent cards={this.state.cards}></DealtHandComponent>
        <DealtHandInput
          value={this.state.cards.map(card => card.toString()).join(" ")}
          onInputChange={this.handleHandSpecifierChange.bind(this)}
        ></DealtHandInput>
      </div>
    );
  }
}

ReactDOM.render(
  React.createElement(Game),
  document.querySelector("#cribbage_analyst")
);
