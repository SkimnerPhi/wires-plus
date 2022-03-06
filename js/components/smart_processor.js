import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumSmartProcessorType = {
    [defaultBuildingVariant]: "stacker",
    stacker: "stacker",
    painter: "painter",
    nipper: "nipper",
};

export class SmartProcessorComponent extends Component {
    static getId() {
        return "SmartProcessor";
    }
    constructor({ type = enumSmartProcessorType.stacker }) {
        super();
        this.type = type;
    }
}
