const { Vector, enumDirection } = require("shapez/core/vector");
const { WiredPinsComponent, enumPinSlotType } = require("shapez/game/components/wired_pins");
const { defaultBuildingVariant } = require("shapez/game/meta_building");
const { enumHubGoalRewards } = require("shapez/game/tutorial_goals");
const { ModMetaBuilding } = require("shapez/mods/mod_meta_building");
const { enumEdgeDetectorType, EdgeDetectorComponent } = require("../components/edge_detector");

import risingBaseImage from "../res/sprites/buildings/edge_detector_rising.png";
import risingGhostImage from "../res/sprites/blueprints/edge_detector_rising.png";
import fallingBaseImage from "../res/sprites/buildings/edge_detector_falling.png";
import fallingGhostImage from "../res/sprites/blueprints/edge_detector_falling.png";
import changeBaseImage from "../res/sprites/buildings/edge_detector_change.png";
import changeGhostImage from "../res/sprites/blueprints/edge_detector_change.png";

export class MetaEdgeDetectorBuilding extends ModMetaBuilding {
    constructor() {
        super("edgeDetector");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Rising Edge Detector",
                description: "Pulses true when the input goes from low to high",
                regularImageBase64: risingBaseImage,
                blueprintImageBase64: risingGhostImage,
                tutorialImageBase64: risingBaseImage,
            },
            {
                variant: enumEdgeDetectorType.falling,
                name: "Falling Edge Detector",
                description: "Pulses true when the input goes from high to low",
                regularImageBase64: fallingBaseImage,
                blueprintImageBase64: fallingGhostImage,
                tutorialImageBase64: fallingBaseImage,
            },
            {
                variant: enumEdgeDetectorType.change,
                name: "Change Detector",
                description: "Pulses true when the input changes",
                regularImageBase64: changeBaseImage,
                blueprintImageBase64: changeGhostImage,
                tutorialImageBase64: changeBaseImage,
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
