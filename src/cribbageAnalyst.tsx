/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { List, ValueObject, hash } from "immutable";

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

class Card implements ValueObject {
  constructor(readonly index: Index, readonly suit?: Suit) {}

  equals(other: any): boolean {
    if (other instanceof Card) {
      return (
        typeof other.suit !== "undefined" &&
        other.index === this.index &&
        other.suit === this.suit
      );
    }
    return false;
  }

  hashCode(): number {
    const PRIME = 31;
    return PRIME * (PRIME + hash(this.index)) + hash(this.suit);
  }

  toString(): string {
    return `${indexString(this.index)}${
      typeof this.suit === "undefined" ? "" : suitString(this.suit)
    }`;
  }
}

interface CardComponentProps {
  card: Card;
  delete: (Card) => void;
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

  handleClick(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    this.props.delete(this.props.card);
  }

  static readonly MARGIN_RIGHT = 3.7;
  static readonly BORDER_WIDTH = "0.03em";
  static readonly BORDER_COLOR = "lightGrey";

  render() {
    return (
      <span
        style={{
          position: "relative",
          cursor: "pointer",
          marginRight: CardComponent.MARGIN_RIGHT
        }}
        onClick={this.handleClick.bind(this)}
      >
        <span
          style={{
            border: "solid",
            borderWidth: CardComponent.BORDER_WIDTH,
            borderColor: CardComponent.BORDER_COLOR,
            padding: "0.05em 0.185em",
            margin: "0.09em",
            backgroundColor: "#f8f8f8",
            color: this.getColor(this.props.card.suit)
          }}
        >
          {this.props.card.toString()}
        </span>
        <span
          style={{
            position: "absolute",
            top: -4.4,
            right: -CardComponent.MARGIN_RIGHT + 1.4,
            fontSize: "x-small",
            color: "darkred",
            border: "solid",
            borderWidth: CardComponent.BORDER_WIDTH,
            borderColor: CardComponent.BORDER_COLOR,
            borderRadius: CardComponent.MARGIN_RIGHT,
            lineHeight: 0.5,
            backgroundColor: "white",
            padding: 0.7
          }}
        >
          &times;
        </span>
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
  delete: (Card) => void;
}

class DealtHandComponent extends React.Component<DealtHandProps> {
  render() {
    return this.props.dealtHand.cards
      .map((card, key) => (
        <CardComponent
          card={card}
          delete={this.props.delete}
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

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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

interface GameProps {
  dealtHand: DealtHand;
}

class Game extends React.Component<{}, GameProps> {
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
    )
      .toOrderedSet()
      .toList();

    // TODO: filter out indices occurring for the fifth or more time.

    this.setState({
      dealtHand: new DealtHand(newCards)
    });
  }

  delete(card: Card): void {
    this.setState({
      dealtHand: new DealtHand(
        this.state.dealtHand.cards.filter(
          dealtHandCard => dealtHandCard !== card
        )
      )
    });
  }

  render() {
    return (
      <div>
        <DealtHandComponent
          dealtHand={this.state.dealtHand}
          delete={this.delete.bind(this)}
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
