import { Component } from "shapez/game/component";
import { enumWireType } from "shapez/game/components/wire";

export class BundleComponent extends Component {
    static getId() {
        return "Bundle";
    }

    constructor({ type = enumWireType.forward }) {
        super();
        
        this.type = type;
        this.linkedNetworks = {};
    }
}
