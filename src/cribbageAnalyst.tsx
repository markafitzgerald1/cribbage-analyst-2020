/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { List, ValueObject, hash } from "immutable";
import Keycode from "keycode";
import { combination } from "js-combinatorics";

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

const INDEX_STRINGS: List<string> = List(
  "A,2,3,4,5,6,7,8,9,T,J,Q,K".split(",")
);

function indexString(index: Index): string {
  return INDEX_STRINGS.get(index);
}

enum Suit {
  Clubs,
  Diamonds,
  Hearts,
  Spades
}

const SUIT_STRINGS: List<string> = List("♣♦♥♠");

function suitString(suit: Suit): string {
  return SUIT_STRINGS.get(suit);
}

class Card implements ValueObject {
  constructor(readonly index?: Index, readonly suit?: Suit) {}

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
    const hasIndex = !(typeof this.index === "undefined");
    const hasSuit = !(typeof this.suit === "undefined");

    if (hasIndex) {
      if (hasSuit) {
        return `${indexString(this.index)}${suitString(this.suit)}`;
      }

      return indexString(this.index);
    }

    return `?${hasSuit ? suitString(this.suit) : ""}`;
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

const toCardComponent = (
  deleteCard: (card: Card) => void,
  keyPrefix?: string
) => (card: Card, key: number): JSX.Element => (
  <CardComponent
    card={card}
    delete={deleteCard}
    key={`${keyPrefix || ""}${card.toString()}-${key + 1}`}
  ></CardComponent>
);

interface DealtHandProps {
  dealtHand: DealtHand;
  delete: (Card) => void;
}

const PLACEHOLDER_TEXT_STYLE: object = { color: "grey", fontStyle: "italic" };

class DealtHandComponent extends React.Component<DealtHandProps> {
  render() {
    return this.props.dealtHand.cards.isEmpty() ? (
      <div style={PLACEHOLDER_TEXT_STYLE}>Enter cards to be analyzed</div>
    ) : (
      this.props.dealtHand.cards
        .map(toCardComponent(this.props.delete))
        .toArray()
    );
  }
}

interface KeptHandProps {
  keptHand: DealtHand;
}

class PossibleKeptHands extends React.Component<KeptHandProps> {
  static readonly KEPT_HAND_SIZE: number = 4;

  // FIXME: filter out duplicates (e.g. two ways to discard the same thing in a suitless
  // hand) as otherwise React misbehaves after many UI actions
  render() {
    return this.props.keptHand.cards.size < PossibleKeptHands.KEPT_HAND_SIZE ? (
      <span style={PLACEHOLDER_TEXT_STYLE}>
        (this is where the analysis will go)
      </span>
    ) : (
      combination(
        this.props.keptHand.cards.toArray(),
        PossibleKeptHands.KEPT_HAND_SIZE
      ).map(possibleKeep => (
        <div key={possibleKeep.join("-")}>
          Keep{" "}
          {possibleKeep.map(
            toCardComponent(
              this.props.delete,
              `keep-${possibleKeep.join("-")}-kept-`
            )
          )}
          , discard{" "}
          {this.props.keptHand.cards
            .filter(value => !possibleKeep.includes(value))
            .map(
              toCardComponent(
                this.props.delete,
                `keep-${possibleKeep.join("-")}-discarded-`
              )
            )}{" "}
          = ? points.
        </div>
      ))
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

  componentDidMount() {
    document.addEventListener(
      "keypress",
      this.handleKeyPress.bind(this),
      false
    );
    document.addEventListener("keydown", this.handleKeyDown.bind(this), false);
  }

  componentWillUnmount() {
    document.removeEventListener(
      "keypress",
      this.handleKeyPress.bind(this),
      false
    );
    document.removeEventListener(
      "keydown",
      this.handleKeyDown.bind(this),
      false
    );
  }

  handleKeyDown(event: KeyboardEvent): any {
    if (event.keyCode === Keycode("Escape")) {
      this.setState({
        dealtHand: DealtHand.of()
      });
    } else if (
      event.keyCode === Keycode("Delete") ||
      event.keyCode === Keycode("Backspace")
    ) {
      this.setState((prevState, props) => {
        if (
          typeof prevState.dealtHand.cards.last(new Card()).index ===
            "undefined" ||
          typeof prevState.dealtHand.cards.last(new Card()).suit === "undefined"
        ) {
          return {
            dealtHand: new DealtHand(this.state.dealtHand.cards.pop())
          };
        }

        return {
          dealtHand: new DealtHand(
            this.state.dealtHand.cards
              .pop()
              .push(new Card(this.state.dealtHand.cards.last(new Card()).index))
          )
        };
      });
      event.preventDefault();
    }
  }

  handleKeyPress(event: KeyboardEvent): any {
    if (event.key.match(/^[A2-91TJQK?]$/i)) {
      const index: number = INDEX_STRINGS.indexOf(
        event.key.toUpperCase().replace(/^10?/, "T")
      );

      this.setState((prevState, props) => {
        const lastCard: Card = prevState.dealtHand.cards.last(new Card());
        if (typeof lastCard.index === "undefined") {
          return {
            dealtHand: new DealtHand(
              prevState.dealtHand.cards
                .pop()
                .push(new Card(index, lastCard.suit))
            )
          };
        }

        return {
          dealtHand: new DealtHand(
            prevState.dealtHand.cards.push(
              new Card(event.key === "?" ? undefined : index)
            )
          )
        };
      });

      return undefined;
    }

    if (event.key.match(/^[CDHS♣♦♥♠]$/i)) {
      const suit: number = SUIT_STRINGS.indexOf(
        event.key
          .toUpperCase()
          .replace(/[C♧]/, "♣")
          .replace(/[D♢]/, "♦")
          .replace(/[H♡]/, "♥")
          .replace(/[S♤]/, "♠")
      );

      this.setState((prevState, props) => {
        const lastCard: Card = prevState.dealtHand.cards.last(new Card());
        if (typeof lastCard.suit === "undefined") {
          return {
            dealtHand: new DealtHand(
              prevState.dealtHand.cards
                .pop()
                .push(new Card(lastCard.index, suit))
            )
          };
        }

        return {
          dealtHand: new DealtHand(
            prevState.dealtHand.cards.push(new Card(undefined, suit))
          )
        };
      });

      return undefined;
    }
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
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>
          Cribbage Analyst 2020
        </h1>
        <DealtHandComponent
          dealtHand={this.state.dealtHand}
          delete={this.delete.bind(this)}
        ></DealtHandComponent>
        <PossibleKeptHands keptHand={this.state.dealtHand}></PossibleKeptHands>
      </div>
    );
  }
}

ReactDOM.render(
  React.createElement(Game),
  document.querySelector("#cribbage_analyst")
);
