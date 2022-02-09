import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { DiodeComponent } from "../components/diode";

export class DiodeSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [DiodeComponent]);
    }

    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const slotComp = entity.components.WiredPins;

            const inputNetwork = slotComp.slots[0].linkedNetwork;
            if (!inputNetwork || inputNetwork.valueConflict) {
                slotComp.slots[1].value = null;
            } else {
                slotComp.slots[1].value = inputNetwork.currentValue;
            }
        }
    }
}
