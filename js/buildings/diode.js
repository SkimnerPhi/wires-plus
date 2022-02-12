import { Vector, enumDirection } from "shapez/core/vector";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { DiodeComponent } from "../components/diode";

import baseImage from "../../res/sprites/buildings/diode.png";
import ghostImage from "../../res/sprites/blueprints/diode.png";
import demoImage from "../../res/sprites/building_tutorials/diode.png";

export class MetaDiodeBuilding extends ModMetaBuilding {
    constructor() {
        super("diode");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Diode",
                description: "A simple one-way gate.",
                regularImageBase64: baseImage,
                blueprintImageBase64: ghostImage,
                tutorialImageBase64: demoImage,
            },
        ];
    }
    getSilhouetteColor() {
        return "#C6B88F";
    }
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_logic_gates);
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
            new WiredPinsComponent({
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

        entity.addComponent(new DiodeComponent());
    }
}
