const { Vector, enumDirection } = require("shapez/core/vector");
const { WiredPinsComponent, enumPinSlotType } = require("shapez/game/components/wired_pins");
const { defaultBuildingVariant } = require("shapez/game/meta_building");
const { enumHubGoalRewards } = require("shapez/game/tutorial_goals");
const { ModMetaBuilding } = require("shapez/mods/mod_meta_building");
const { DiodeComponent } = require("../components/diode");

import baseImage from "../res/sprites/buildings/diode.png";
import ghostImage from "../res/sprites/blueprints/diode.png";

export class MetaDiodeBuilding extends ModMetaBuilding {
    constructor() {
        super("diode");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Diode",
                description: "A simple one-way gate",
                regularImageBase64: baseImage,
                blueprintImageBase64: ghostImage,
                tutorialImageBase64: baseImage,
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
