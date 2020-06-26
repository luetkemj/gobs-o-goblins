import { Component } from "geotic";

export class Appearance extends Component {
  static properties = {
    color: "#ff0077",
    char: "?",
    background: "#000",
  };
}

export class IsBlocking extends Component {}

export class Move extends Component {
  static properties = { x: 0, y: 0 };
}

export class Position extends Component {
  static properties = { x: 0, y: 0 };
}
