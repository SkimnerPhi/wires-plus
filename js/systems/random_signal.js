import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { RandomSignalComponent } from "../components/random_signal";
import { castBool } from "../utils";

export class RandomSignalSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [RandomSignalComponent]);
    }

    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const rngComp = entity.components.RandomSignal;
            const slotComp = entity.components.WiredPins;

            rngComp.value ^= rngComp.value << 7 & 0xFFFF;
            rngComp.value ^= rngComp.value >> 9 & 0xFFFF;
            rngComp.value ^= rngComp.value << 8 & 0xFFFF;
            
            slotComp.slots[0].value = castBool(rngComp.value & 1);
        }
    }
}
