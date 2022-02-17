import { Vector, enumDirection } from "shapez/core/vector";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { DiodeComponent, enumDiodeType } from "../components/diode";
import { generateMatrixRotations } from "shapez/core/utils";

const colors = {
    [defaultBuildingVariant]: "#bc3a61",
    [enumDiodeType.buffer]: "#f44184"
};

const overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    [enumDiodeType.buffer]: generateMatrixRotations([0, 1, 0, 0, 0, 0, 0, 1, 0])
};

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
            },
            {
                variant: enumDiodeType.buffer,
                name: "Buffer",
                description: "Emits a boolean \"1\" if the input is truthy. (Truthy means shape, color, or boolean \"1\")",
            }
        ];
    }
    getSilhouetteColor(variant) {
        return colors[variant];
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumDiodeType.buffer];
    }
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
        return overlayMatrices[variant][rotation];
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
        const diodeType = enumDiodeType[variant];
        entity.components.Diode.type = diodeType;
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

        entity.addComponent(new DiodeComponent({}));
    }
}
