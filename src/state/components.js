import { Component } from "geotic";

export class Appearance extends Component {
  static properties = {
    color: "#ff0077",
    char: "?",
  };
}

export class Move extends Component {
  static properties = { x: 0, y: 0 };
}

export class Position extends Component {
  static properties = { x: 0, y: 0 };
}
