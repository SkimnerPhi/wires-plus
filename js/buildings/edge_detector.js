import { Vector, enumDirection } from "shapez/core/vector";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumEdgeDetectorType, EdgeDetectorComponent } from "../components/edge_detector";

import demoImage from "../../res/sprites/building_tutorials/edgeDetector.png";

export class MetaEdgeDetectorBuilding extends ModMetaBuilding {
    constructor() {
        super("edgeDetector");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Rising Edge Detector",
                description: "Pulses true when the input goes from low to high.",
                tutorialImageBase64: demoImage,
            },
            {
                variant: enumEdgeDetectorType.falling,
                name: "Falling Edge Detector",
                description: "Pulses true when the input goes from high to low.",
                tutorialImageBase64: demoImage,
            },
            {
                variant: enumEdgeDetectorType.change,
                name: "Change Detector",
                description: "Pulses true when the input changes.",
                tutorialImageBase64: demoImage,
            },
        ];
    }
    getSilhouetteColor() {
        return "#8FB8C6";
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumEdgeDetectorType.falling, enumEdgeDetectorType.change];
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
    updateVariants(entity, rotationVariant, variant) {
        const edgeDetectorType = enumEdgeDetectorType[variant];
        entity.components.EdgeDetector.type = edgeDetectorType;
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

        entity.addComponent(new EdgeDetectorComponent({}));
    }
}
