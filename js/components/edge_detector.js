import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumEdgeDetectorType = {
    [defaultBuildingVariant]: "rising",
    rising: "rising",
    falling: "falling",
    change: "change",
};
export class EdgeDetectorComponent extends Component {
    static getId() {
        return "EdgeDetector";
    }
    constructor({ type = enumEdgeDetectorType.rising }) {
        super();
        this.type = type;
        this.lastValue = null;
    }
}
