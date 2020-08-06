import { remove } from "lodash";
import { Component } from "geotic";
import { addCacheSet, deleteCacheSet } from "./cache";

const effectProps = {
  component: "",
  delta: "",
  animate: { char: "", color: "" },
  events: [], // { name: "", args: {} },
  addComponents: [], // { name: '', properties: {} }
  duration: 0, // in turns
};

export class ActiveEffects extends Component {
  static allowMultiple = true;
  static properties = effectProps;
}

export class Ai extends Component {}

export class Animate extends Component {
  static allowMultiple = true;
  static properties = {
    startTime: null,
    duration: 250,
    char: "",
    color: "",
  };

  onSetStartTime(evt) {
    if (!this.startTime) {
      this.startTime = evt.data.time;
    }
  }
}

export class Appearance extends Component {
  static properties = {
    color: "#ff0077",
    char: "?",
    background: "#000",
  };
}

export class Defense extends Component {
  static properties = { max: 1, current: 1 };
}

export class Description extends Component {
  static properties = { name: "No Name" };
}

export class Effects extends Component {
  static allowMultiple = true;
  static properties = effectProps;
}

export class Health extends Component {
  static properties = { max: 10, current: 10 };

  onTakeDamage(evt) {
    this.current -= evt.data.amount;

    if (this.current <= 0) {
      this.entity.appearance.char = "%";
      this.entity.remove("Ai");
      this.entity.remove("IsBlocking");
      this.entity.add("IsDead");
      this.entity.remove("Layer400");
      this.entity.add("Layer300");
    }

    evt.handle();
  }
}

export class Inventory extends Component {
  static properties = {
    list: "<EntityArray>",
  };

  onPickUp(evt) {
    this.list.push(evt.data);

    if (evt.data.position) {
      evt.data.remove("Position");
    }
  }

  onDrop(evt) {
    remove(this.list, (x) => x.id === evt.data.id);
    evt.data.add("Position", this.entity.position);
  }
}

export class IsBlocking extends Component {}

export class IsDead extends Component {}

export class IsInFov extends Component {}

export class IsOpaque extends Component {}

export class IsPickup extends Component {}

export class IsRevealed extends Component {}

export class Layer100 extends Component {}

export class Layer300 extends Component {}

export class Layer400 extends Component {}

export class Move extends Component {
  static properties = { x: 0, y: 0, relative: true };
}

export class Paralyzed extends Component {}

export class Position extends Component {
  static properties = { x: 0, y: 0 };

  onAttached() {
    const locId = `${this.entity.position.x},${this.entity.position.y}`;
    addCacheSet("entitiesAtLocation", locId, this.entity.id);
  }

  onDetached() {
    const locId = `${this.x},${this.y}`;
    deleteCacheSet("entitiesAtLocation", locId, this.entity.id);
  }
}

export class Power extends Component {
  static properties = { max: 5, current: 5 };
}

export class RequiresTarget extends Component {
  static properties = {
    acquired: "RANDOM",
  };
}

export class Target extends Component {
  static properties = { locId: "" };
}

export class TargetingItem extends Component {
  static properties = { item: "<Entity>" };
}
