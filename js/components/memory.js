import { Component } from "shapez/game/component";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { typeItemSingleton } from "shapez/game/item_resolver";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { castBool } from "../utils";

export const enumMemoryType = {
    [defaultBuildingVariant]: "jk",
    jk: "jk",
    t: "t",
    simple: "simple",
    writeEnable: "write_enable"
};
export class MemoryComponent extends Component {
    static getId() {
        return "Memory";
    }
    static getSchema() {
        return {
            signal: shapez.types.nullable(typeItemSingleton),
        };
    }
    constructor({ type = enumMemoryType.jk, signal = null }) {
        super();
        this.type = type;
        
        switch(type) {
            case enumMemoryType.jk:
            case enumMemoryType.t: {
                this.signal = castBool(isTruthyItem(signal));
                break;
            }
            case enumMemoryType.simple:
            case enumMemoryType.writeEnable: {
                this.signal = signal;
                break;
            }
        }
    }
}
