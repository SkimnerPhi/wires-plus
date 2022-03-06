import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumWireInsulatorVariants = {
    [defaultBuildingVariant]: defaultBuildingVariant,
    forward: "forward",
    turn: "turn",
    double_turn: "double_turn",
};

export class WireInsulatorComponent extends Component {
    static getId() {
        return "WireInsulator";
    }
    constructor({ type = "forward" }) {
        super();
        this.type = type;
        this.linkedNetworks = [];
    }
}
