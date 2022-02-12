import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import {
    BOOL_FALSE_SINGLETON,
    isTruthyItem,
    BOOL_TRUE_SINGLETON,
    isTrueItem,
} from "shapez/game/items/boolean_item";
import { MemoryComponent, enumMemoryType } from "../components/memory";
import { castBool } from "../utils";

export class MemorySystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [MemoryComponent]);
    }

    update() {
        if (!this.root.gameInitialized) {
            return;
        }

        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const memComp = entity.components.Memory;
            const slotComp = entity.components.WiredPins;

            switch (memComp.type) {
                case enumMemoryType.jk: {
                    const jNetwork = slotComp.slots[0].linkedNetwork;
                    const kNetwork = slotComp.slots[1].linkedNetwork;
                    if (jNetwork?.valueConflict || kNetwork?.valueConflict) {
                        memComp.signal = BOOL_FALSE_SINGLETON;
                        slotComp.slots[2].value = null;
                        slotComp.slots[3].value = null;
                        continue;
                    }

                    const jValue = isTruthyItem(jNetwork?.currentValue);
                    const kValue = isTruthyItem(kNetwork?.currentValue);

                    let inverse;
                    if (jValue && kValue) {
                        inverse = memComp.signal;
                        memComp.signal = castBool(!isTrueItem(memComp.signal));
                    } else if (jValue) {
                        memComp.signal = BOOL_TRUE_SINGLETON;
                        inverse = BOOL_FALSE_SINGLETON;
                    } else if (kValue) {
                        memComp.signal = BOOL_FALSE_SINGLETON;
                        inverse = BOOL_TRUE_SINGLETON;
                    } else {
                        inverse = castBool(!isTrueItem(memComp.signal));
                    }

                    slotComp.slots[2].value = memComp.signal;
                    slotComp.slots[3].value = inverse;

                    break;
                }
                case enumMemoryType.t: {
                    const tNetwork = slotComp.slots[0].linkedNetwork;
                    if (tNetwork?.valueConflict) {
                        memComp.signal = BOOL_FALSE_SINGLETON;
                        slotComp.slots[1].value = null;
                        continue;
                    }

                    const tValue = isTruthyItem(tNetwork?.currentValue);

                    if (tValue) {
                        memComp.signal = castBool(!isTrueItem(memComp.signal));
                    }

                    slotComp.slots[1].value = memComp.signal;

                    break;
                }
                case enumMemoryType.simple: {
                    const iNetwork = slotComp.slots[0].linkedNetwork;
                    if (iNetwork?.valueConflict) {
                        memComp.signal = null;
                        slotComp.slots[1].value = null;
                        continue;
                    }

                    const iValue = iNetwork?.currentValue;

                    if (iValue) {
                        memComp.signal = iValue;
                        slotComp.slots[1].value = memComp.signal;
                    }

                    break;
                }
                case enumMemoryType.write_enable: {
                    const iNetwork = slotComp.slots[0].linkedNetwork;
                    const weNetwork = slotComp.slots[1].linkedNetwork;

                    if (!weNetwork?.valueConflict && isTruthyItem(weNetwork?.currentValue)) {
                        if (iNetwork?.valueConflict) {
                            memComp.signal = null;
                            slotComp.slots[2].value = null;
                            continue;
                        }

                        memComp.signal = iNetwork?.currentValue;
                        slotComp.slots[2].value = memComp.signal;

                        break;
                    }
                }
            }
        }
    }
}
