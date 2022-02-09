import { enumPinSlotType } from "shapez/game/components/wired_pins";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { AdderComponent } from "../components/adder";
import { castBool } from "../utils";

export class AdderSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [AdderComponent]);
    }

    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const slotComp = entity.components.WiredPins;

            let sum = 0;
            let anyConflict = false;

            for (let pin = 0; pin < slotComp.slots.length; pin++) {
                const slot = slotComp.slots[pin];
                if (slot.type !== enumPinSlotType.logicalAcceptor) {
                    continue;
                }
                const network = slot.linkedNetwork;
                if (network) {
                    if (network.valueConflict) {
                        anyConflict = true;
                        break;
                    }
                    if (isTruthyItem(network.currentValue)) {
                        sum++;
                    }
                }
            }

            if (anyConflict) {
                for (let pin = 0; pin < slotComp.slots.length; pin++) {
                    const slot = slotComp.slots[pin];
                    if (slot.type !== enumPinSlotType.logicalEjector) {
                        continue;
                    }
                    slot.value = null;
                }
                continue;
            }

            // Result pin is equal to bit 0 of sum
            slotComp.slots[3].value = castBool(sum & 0x1);
            // Carry pin is equal to bit 1 of sum
            slotComp.slots[4].value = castBool(sum & 0x2);
        }
    }
}
