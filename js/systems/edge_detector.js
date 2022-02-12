import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { EdgeDetectorComponent, enumEdgeDetectorType } from "../components/edge_detector";
import { castBool } from "../utils";

export class EdgeDetectorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [EdgeDetectorComponent]);
    }

    update() {
        if (!this.root.gameInitialized) {
            return;
        }

        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const edgeComp = entity.components.EdgeDetector;
            const slotComp = entity.components.WiredPins;

            const inputNetwork = slotComp.slots[0].linkedNetwork;
            if (inputNetwork?.valueConflict) {
                edgeComp.lastValue = null;
                slotComp.slots[1].value = null;
                continue;
            }
            const inputValue = inputNetwork?.currentValue;

            let output = false;
            switch (edgeComp.type) {
                case enumEdgeDetectorType.rising:
                    output = !isTruthyItem(edgeComp.lastValue) && isTruthyItem(inputValue);
                    break;
                case enumEdgeDetectorType.falling:
                    output = isTruthyItem(edgeComp.lastValue) && !isTruthyItem(inputValue);
                    break;
                case enumEdgeDetectorType.change:
                    output = edgeComp.lastValue !== inputValue;
                    break;
            }

            edgeComp.lastValue = inputValue;
            slotComp.slots[1].value = castBool(output);
        }
    }
}
