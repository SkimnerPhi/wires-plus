import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumDiodeType = {
    [defaultBuildingVariant]: "diode",
    diode: "diode",
    buffer: "buffer",
};

export class DiodeComponent extends Component {
    static getId() {
        return "Diode";
    }

    constructor({ type = enumDiodeType.diode }) {
        super();
        this.type = type;
    }
}
