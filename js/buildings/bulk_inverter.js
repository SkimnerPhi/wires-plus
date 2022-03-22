import { Vector, enumDirection } from "shapez/core/vector";
import { enumPinSlotType } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { BulkInverterComponent } from "../components/bulk_inverter";
import { BundledPinsComponent } from "../components/bundled_pins";
import { isModSafeRewardUnlocked } from "../utils";

export class MetaBulkInverterBuilding extends ModMetaBuilding {
    constructor() {
        super("bulk_inverter");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Bulk Inverter",
                description: "Invert (Logical NOT) multiple signals at a time.",
            },
        ];
    }
    getSilhouetteColor() {
        return "#FF00FF";
    }
    getIsUnlocked(root) {
        return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_logic_gates);
    }
    getLayer() {
        return "wires";
    }
    getDimensions() {
        return new Vector(1, 1);
    }
    getRenderPins() {
        return false;
    }
    setupEntityComponents(entity) {
        entity.addComponent(
            new BundledPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );

        entity.addComponent(new BulkInverterComponent());
    }
}
