import { Component } from "shapez/game/component";
import { enumWireType } from "shapez/game/components/wire";
import { types } from "shapez/savegame/serialization";

export class BundleComponent extends Component {
    static getId() {
        return "Bundle";
    }

    static getSchema() {
        return {
            type: types.string,
        }
    }

    constructor({ type = enumWireType.forward }) {
        super();
        
        this.type = type;
        this.linkedNetworks = {};
    }
}
