import { Component } from "shapez/game/component";
import { BOOL_FALSE_SINGLETON, isTruthyItem } from "shapez/game/items/boolean_item";
import { typeItemSingleton } from "shapez/game/item_resolver";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { castBool } from "../utils";

export const enumMemoryType = {
    [defaultBuildingVariant]: "jk",
    jk: "jk",
    t: "t",
    simple: "simple",
    write_enable: "write_enable",
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
    constructor({ type = enumMemoryType.jk }) {
        super();
        this.type = type;
        this.signal = null;
    }

    clear() {
        switch(this.type) {
            case enumMemoryType.jk:
            case enumMemoryType.t: {
                this.signal = BOOL_FALSE_SINGLETON;
                break;
            }
            case enumMemoryType.simple:
            case enumMemoryType.write_enable: {
                this.signal = null;
                break;
            }
        }
    }
}
