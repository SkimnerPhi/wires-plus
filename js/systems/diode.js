import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { DiodeComponent, enumDiodeType } from "../components/diode";
import { castBool } from "../utils";

export class DiodeSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [DiodeComponent]);
    }

    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const diodeComp = entity.components.Diode;
            const slotComp = entity.components.WiredPins;

            const inputNetwork = slotComp.slots[0].linkedNetwork;
            if (!inputNetwork || inputNetwork.valueConflict) {
                slotComp.slots[1].value = null;
            } else {
                let out;
                switch (diodeComp.type) {
                    case enumDiodeType.diode:
                        out = inputNetwork.currentValue;
                        break;
                    case enumDiodeType.buffer:
                        out = castBool(isTruthyItem(inputNetwork.currentValue));
                        break;
                }
                slotComp.slots[1].value = out;
            }
        }
    }
}
