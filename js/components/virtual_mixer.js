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
    constructor({ type = enumVxMixerType.muxer }) {
        super();
        this.type = type;
    }
}
