import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { MultiplexerComponent, enumMultiplexerType } from "../components/multiplexer";

export class MultiplexerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [MultiplexerComponent]);
    }
    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const muxerComp = entity.components.Multiplexer;
            const slotComp = entity.components.WiredPins;

            const address = isTruthyItem(slotComp.slots[0].linkedNetwork?.currentValue);
            switch (muxerComp.type) {
                case enumMultiplexerType.muxer: {
                    const inputPin = address ? slotComp.slots[1] : slotComp.slots[2];
                    const inputNetwork = inputPin.linkedNetwork;

                    if (inputNetwork?.valueConflict) {
                        slotComp.slots[3].value = null;
                    } else {
                        slotComp.slots[3].value = inputNetwork?.currentValue;
                    }

                    break;
                }
                case enumMultiplexerType.demuxer: {
                    const inputNetwork = slotComp.slots[1].linkedNetwork;
                    const outputValue = inputNetwork?.valueConflict ? null : inputNetwork?.currentValue;

                    if (address) {
                        slotComp.slots[2].value = outputValue;
                        slotComp.slots[3].value = null;
                    } else {
                        slotComp.slots[2].value = null;
                        slotComp.slots[3].value = outputValue;
                    }

                    break;
                }
            }
        }
    }
}
