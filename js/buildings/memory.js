import { Vector, enumDirection } from "shapez/core/vector";
import { enumPinSlotType, WiredPinsComponent } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumMemoryType, MemoryComponent } from "../components/memory";

import jkBaseImage from "../../res/sprites/buildings/memory_jk.png";
import jkGhostImage from "../../res/sprites/blueprints/memory_jk.png";
import jkDemoImage from "../../res/sprites/building_tutorials/memory_jk.png";
import tBaseImage from "../../res/sprites/buildings/memory_t.png";
import tGhostImage from "../../res/sprites/blueprints/memory_t.png";
import tDemoImage from "../../res/sprites/building_tutorials/memory_t.png";
import simpleBaseImage from "../../res/sprites/buildings/memory_simple.png";
import simpleGhostImage from "../../res/sprites/blueprints/memory_simple.png";
import simpleDemoImage from "../../res/sprites/building_tutorials/memory_simple.png";
import writeEnableBaseImage from "../../res/sprites/buildings/memory_write_enable.png";
import writeEnableGhostImage from "../../res/sprites/blueprints/memory_write_enable.png";
import writeEnableDemoImage from "../../res/sprites/building_tutorials/memory_write_enable.png";

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
                tutorialImageBase64: jkDemoImage,
            },
            {
                variant: enumMemoryType.t,
                name: "T Flip-Flop",
                description: "Toggles the output when the input is triggered.",
                regularImageBase64: tBaseImage,
                blueprintImageBase64: tGhostImage,
                tutorialImageBase64: tDemoImage,
            },
            {
                variant: enumMemoryType.simple,
                name: "Simple Memory Cell",
                description: "Stores the last value input. Conflict resets the memory.",
                regularImageBase64: simpleBaseImage,
                blueprintImageBase64: simpleGhostImage,
                tutorialImageBase64: simpleDemoImage,
            },
            {
                variant: enumMemoryType.writeEnable,
                name: "Write-Enable Memory Cell",
                description: "Stores the left input when the bottom input is enabled.",
                regularImageBase64: writeEnableBaseImage,
                blueprintImageBase64: writeEnableGhostImage,
                tutorialImageBase64: writeEnableDemoImage,
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
            enumMemoryType.writeEnable,
        ];
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
            case enumMemoryType.writeEnable:
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
            case enumMemoryType.writeEnable:
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
