import { RandomNumberGenerator } from "shapez/core/rng";
import { Component } from "shapez/game/component";
import { types } from "shapez/savegame/serialization";

export class RandomSignalComponent extends Component {
    static getId() {
        return "RandomSignal";
    }

    static getSchema() {
        return {
            value: types.uint,
        };
    }

    constructor() {
        super();
        this.value = new RandomNumberGenerator().nextIntRange(0, 65536);
    }
}