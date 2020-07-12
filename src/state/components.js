import { Component } from "geotic";
import { addCacheSet, deleteCacheSet } from "./cache";

export class ActiveEffects extends Component {
  static allowMultiple = true;
  static properties = { component: "", delta: "" };
}

export class Ai extends Component {}

export class Appearance extends Component {
  static properties = {
    color: "#ff0077",
    char: "?",
    background: "#000",
  };
}

export class Consumable extends Component {
  onConsume() {
    this.entity.destroy();
  }
}

export class Defense extends Component {
  static properties = { max: 1, current: 1 };
}

export class Description extends Component {
  static properties = { name: "noname" };
}

export class Effects extends Component {
  static allowMultiple = true;
  static properties = { component: "", delta: "", active: false };
}

export class Health extends Component {
  static properties = { max: 10, current: 10 };

  onTakeDamage(evt) {
    this.current -= evt.data.amount;
    evt.handle();
  }
}

export class Inventory extends Component {
  static properties = {
    list: [],
  };

  onPickUp(evt) {
    this.list.push(evt.data);

    evt.handle();
  }

  onDrop(evt) {
    this.list.splice(evt.data.index, 1);
    evt.handle();
  }

  onRemove(evt) {
    this.list.splice(evt.data.index, 1);
    evt.handle();
  }
}

export class IsBlocking extends Component {}

export class IsDead extends Component {}

export class IsInFov extends Component {}

export class IsOpaque extends Component {}

export class IsPickup extends Component {
  onPickUp(evt) {
    // todo: handle this on a Position component's onBeforeDetached method
    // https://github.com/ddmills/geotic/issues/15
    const locId = `${this.entity.position.x},${this.entity.position.y}`;
    deleteCacheSet("entitiesAtLocation", locId, this.entity.id);

    this.entity.remove("Position");
    evt.handle();
  }

  onDrop(evt) {
    const { x, y } = evt.data;
    this.entity.add("Position", { x, y });

    evt.handle();
  }
}

export class IsRevealed extends Component {}

export class Layer100 extends Component {}

export class Layer300 extends Component {}

export class Layer400 extends Component {}

export class Move extends Component {
  static properties = { x: 0, y: 0, relative: true };
}

export class Position extends Component {
  static properties = { x: 0, y: 0 };

  onAttached() {
    const locId = `${this.entity.position.x},${this.entity.position.y}`;
    addCacheSet("entitiesAtLocation", locId, this.entity.id);
  }
}

export class Power extends Component {
  static properties = { max: 5, current: 5 };
}
