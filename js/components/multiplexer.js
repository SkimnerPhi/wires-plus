import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumMultiplexerType = {
    [defaultBuildingVariant]: "muxer",
    muxer: "muxer",
    demuxer: "demuxer",
};

export class MultiplexerComponent extends Component {
    static getId() {
        return "Multiplexer";
    }
    constructor({ type = enumMultiplexerType.muxer }) {
        super();
        this.type = type;
    }
}
