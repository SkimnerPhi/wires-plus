import { Vector, enumDirection } from "shapez/core/vector";
import { enumPinSlotType, WiredPinsComponent } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumMemoryType, MemoryComponent } from "../components/memory";
import { generateMatrixRotations } from "shapez/core/utils";
import { isModSafeRewardUnlocked } from "../utils";

const overlayMatrices = {
    [enumMemoryType.t]: generateMatrixRotations([0, 1, 0, 1, 0, 1, 1, 1, 1]),
    [enumMemoryType.simple]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1])
};

export class MetaMemoryBuilding extends ModMetaBuilding {
    constructor() {
        super("memory");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "JK Flip-Flop",
                description: "Stores a boolean value based on which input was triggered last.",
            },
            {
                variant: enumMemoryType.t,
                name: "T Flip-Flop",
                description: "Toggles the output when the input is triggered.",
            },
            {
                variant: enumMemoryType.simple,
                name: "Simple Memory Cell",
                description: "Stores the last value input. Conflict resets the memory.",
            },
            {
                variant: enumMemoryType.write_enable,
                name: "Write-Enable Memory Cell",
                description: "Stores the left input when the bottom input is enabled.",
            }
        ];
    }
    getSilhouetteColor() {
        return "#80B3FF";
    }
    getAvailableVariants(root) {
        return [
            defaultBuildingVariant,
            enumMemoryType.t,
            enumMemoryType.simple,
            enumMemoryType.write_enable,
        ];
    }
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
        return overlayMatrices[variant]?.[rotation];
    }
    getIsUnlocked(root) {
        return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_logic_gates);
    }
    getLayer() {
        return "wires";
    }
    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
            case enumMemoryType.write_enable:
                return new Vector(2, 1);
            case enumMemoryType.t:
            case enumMemoryType.simple:
                return new Vector(1, 1);
        }
    }
    getRenderPins() {
        return false;
    }
    updateVariants(entity, rotationVariant, variant) {
        const memoryType = enumMemoryType[variant];
        entity.components.Memory.type = memoryType;
        entity.components.Memory.clear();

        const pinComp = entity.components.WiredPins;

        switch (variant) {
            case defaultBuildingVariant:
                pinComp.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ]);
                break;
            case enumMemoryType.t:
            case enumMemoryType.simple:
                pinComp.setSlots([
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
                ]);
                break;
            case enumMemoryType.write_enable:
                pinComp.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalEjector,
                    },
                ]);
                break;
        }
    }
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [],
            })
        );

        entity.addComponent(new MemoryComponent({}));
    }
}
