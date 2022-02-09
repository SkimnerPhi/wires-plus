import { Component } from "shapez/game/component";
import { BOOL_FALSE_SINGLETON } from "shapez/game/items/boolean_item";
import { typeItemSingleton } from "shapez/game/item_resolver";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumMemoryType = {
    [defaultBuildingVariant]: "sr",
    jk: "jk",
    t: "t",
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
        // this is in place to support non-boolean values in the future
        this.signal = !signal && type !== null ? BOOL_FALSE_SINGLETON : signal;
    }
}
