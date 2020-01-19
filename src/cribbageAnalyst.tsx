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
const RED_SUITS: List<Suit> = List.of(Suit.Diamonds, Suit.Hearts);

class CardComponent extends React.Component<CardComponentProps> {
  getColor(suit: Suit): string {
    if (BLACK_SUITS.contains(suit)) {
      return "black";
    }
    if (RED_SUITS.contains(suit)) {
      return "red";
    }
    return "green";
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

class DealtHand {
  constructor(readonly cards: List<Card>) {}

  static of(...cards: Card[]): DealtHand {
    return new DealtHand(List(cards));
  }

  toString() {
    return this.cards.map(card => card.toString()).join(" ");
  }
}

interface DealtHandProps {
  dealtHand: DealtHand;
}

class DealtHandComponent extends React.Component<DealtHandProps> {
  render() {
    return this.props.dealtHand.cards
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
  { dealtHand: DealtHand; onInputChange: (event) => void },
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
            value={this.props.dealtHand.cards
              .map(card => card.toString())
              .join(" ")}
            onChange={this.handleChange}
          />
        </label>
      </div>
    );
  }
}

class Game extends React.Component<{}, DealtHandProps> {
  constructor(props) {
    super(props);
    this.state = { dealtHand: DealtHand.of() };
  }

  handleHandSpecifierChange(handSpecifier: string): void {
    const cardSpecifiers = handSpecifier.match(
      /(A|[2-9]|10?|T|J|Q|K)([C♣D♦H♥S♠])?/gi
    );
    if (!cardSpecifiers) {
      this.setState({ dealtHand: DealtHand.of() });
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
      dealtHand: new DealtHand(newCards)
    });
  }

  render() {
    return (
      <div>
        <DealtHandComponent
          dealtHand={this.state.dealtHand}
        ></DealtHandComponent>
        <DealtHandInput
          dealtHand={this.state.dealtHand}
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
