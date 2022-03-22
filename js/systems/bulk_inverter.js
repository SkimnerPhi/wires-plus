import { enumColors } from "shapez/game/colors";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { BulkInverterComponent } from "../components/bulk_inverter";
import { castBool } from "../utils";

export class BulkInverterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BulkInverterComponent]);
    }

    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const slotComp = entity.components.BundledPins;

            let anyConflict = false;
            const result = {};

            const channels = slotComp.slots[0].channels;
            for (let color in enumColors) {
                const network = channels[color].linkedNetwork;
                if (network?.valueConflict) {
                    anyConflict = true;
                    break;
                }
                result[color] = network ? !isTruthyItem(network.currentValue) : true;
            }

            for (let color in enumColors) {
                slotComp.slots[1].channels[color].value = anyConflict ? null : castBool(result[color]);
            }
        }
    }
}
