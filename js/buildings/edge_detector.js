import { Vector, enumDirection } from "shapez/core/vector";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumEdgeDetectorType, EdgeDetectorComponent } from "../components/edge_detector";
import { generateMatrixRotations } from "shapez/core/utils";
import { isModSafeRewardUnlocked } from "../utils";

const overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([1, 1, 0, 1, 1, 0, 0, 1, 0]),
    [enumEdgeDetectorType.falling]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 0, 1]),
    [enumEdgeDetectorType.change]: generateMatrixRotations([1, 1, 0, 1, 0, 0, 1, 1, 0])
};

export class MetaEdgeDetectorBuilding extends ModMetaBuilding {
    constructor() {
        super("edge_detector");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Rising Edge Detector",
                description: "Pulses true when the input goes from low to high.",
            },
            {
                variant: enumEdgeDetectorType.falling,
                name: "Falling Edge Detector",
                description: "Pulses true when the input goes from high to low.",
            },
            {
                variant: enumEdgeDetectorType.change,
                name: "Change Detector",
                description: "Pulses true when the input changes.",
            },
        ];
    }
    getSilhouetteColor() {
        return "#8FB8C6";
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumEdgeDetectorType.falling, enumEdgeDetectorType.change];
    }
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
        return overlayMatrices[variant][rotation];
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
