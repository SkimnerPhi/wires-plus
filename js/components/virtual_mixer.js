import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumVxMixerType = {
    [defaultBuildingVariant]: "mixer",
    mixer: "mixer",
    unmixer: "unmixer",
};

export class VirtualMixerComponent extends Component {
    static getId() {
        return "VirtualMixer";
    }
    constructor({ type = enumVxMixerType.mixer }) {
        super();
        this.type = type;
    }
}
