import { Component } from "geotic";
import { addCacheSet } from "./cache";

export class Appearance extends Component {
  static properties = {
    color: "#ff0077",
    char: "?",
    background: "#000",
  };
}

export class Description extends Component {
  static properties = { name: "noname" };
}

export class IsBlocking extends Component {}

export class IsInFov extends Component {}

export class IsOpaque extends Component {}

export class IsRevealed extends Component {}

export class Layer100 extends Component {}

export class Layer300 extends Component {}

export class Layer400 extends Component {}

export class Move extends Component {
  static properties = { x: 0, y: 0 };
}

export class Position extends Component {
  static properties = { x: 0, y: 0 };

  onAttached() {
    const locId = `${this.entity.position.x},${this.entity.position.y}`;
    addCacheSet("entitiesAtLocation", locId, this.entity.id);
  }
}
