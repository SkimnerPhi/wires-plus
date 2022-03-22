import { enumColors } from "shapez/game/colors";
import { Component } from "shapez/game/component";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { typeItemSingleton } from "shapez/game/item_resolver";
import { types } from "shapez/savegame/serialization";

export const arrayMainColors = [
    enumColors.uncolored,
    enumColors.red,
    enumColors.yellow,
    enumColors.green,
    enumColors.cyan,
    enumColors.blue,
    enumColors.purple,
    enumColors.white,
];

export class BundledPinsComponent extends Component {
    static getId() {
        return "BundledPins";
    }
    static getSchema() {
        return {
            slots: types.fixedSizeArray(
                types.structured({
                    channels: types.keyValueMap(
                        types.structured({
                            value: types.nullable(typeItemSingleton)
                        }), true
                    )
                })
            )
        };
    }
    constructor({ slots = [] }) {
        super();
        this.setSlots(slots);
    }

    setSlots(slots) {
        this.slots = [];

        for (let i = 0; i < slots.length; ++i) {
            const slotData = slots[i];

            const slotToAdd = {
                pos: slotData.pos,
                type: slotData.type,
                direction: slotData.direction,
                channels: {},
            }
            for (const color in enumColors) {
                slotToAdd.channels[color] = {
                    value: null,
                    linkedNetwork: null,
                };
            }
            this.slots.push(slotToAdd);
        }
    }
}