import { enumDirection } from "shapez/core/vector";
import { Component } from "shapez/game/component";
import { types } from "shapez/savegame/serialization";

export const bundleConnectionFacing = enumDirection.top;
export const wireConnectionFacing = enumDirection.bottom;

export class BundleInterfaceComponent extends Component {
    static getId() {
        return "BundleInterface";
    }

    static getSchema() {
        return {
            channel: types.string,
        }
    }

    constructor({ channel = null }) {
        super();
        
        this.channel = channel;
        this.linkedNetwork = null;
    }

    copyAdditionalStateTo(otherComponent) {
        otherComponent.channel = this.channel;
    }
}
