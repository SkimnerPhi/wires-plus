import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumColorProcessorType = {
    [defaultBuildingVariant]: "adder",
    adder: "adder",
    subtractor: "subtractor",
};

export class ColorProcessorComponent extends Component {
    static getId() {
        return "ColorProcessor";
    }
    constructor({ type = enumColorProcessorType.adder }) {
        super();
        this.type = type;
    }
}
