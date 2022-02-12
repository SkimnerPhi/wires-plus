import { Vector, enumDirection } from "shapez/core/vector";
import { enumPinSlotType, WiredPinsComponent } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumMemoryType, MemoryComponent } from "../components/memory";

import jkBaseImage from "../../res/sprites/buildings/memory_jk.png";
import jkGhostImage from "../../res/sprites/blueprints/memory_jk.png";
import tBaseImage from "../../res/sprites/buildings/memory_t.png";
import tGhostImage from "../../res/sprites/blueprints/memory_t.png";

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
                regularImageBase64: jkBaseImage,
                blueprintImageBase64: jkGhostImage,
                tutorialImageBase64: jkBaseImage,
            },
            {
                variant: enumMemoryType.t,
                name: "T Flip-Flop",
                description: "Toggles the output when the input is triggered.",
                regularImageBase64: tBaseImage,
                blueprintImageBase64: tGhostImage,
                tutorialImageBase64: tBaseImage,
            },
        ];
    }
    getSilhouetteColor() {
        return "#80B3FF";
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumMemoryType.t];
    }
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_logic_gates);
    }
    getLayer() {
        return "wires";
    }
    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(2, 1);
            case enumMemoryType.t:
                return new Vector(1, 1);
        }
    }
    getRenderPins() {
        return false;
    }
    updateVariants(entity, rotationVariant, variant) {
        const memoryType = enumMemoryType[variant];
        entity.components.Memory.type = memoryType;

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
