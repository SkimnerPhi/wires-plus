import { Vector, enumDirection } from "shapez/core/vector";
import { enumPinSlotType, WiredPinsComponent } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumMultiplexerType, MultiplexerComponent } from "../components/multiplexer";

import multiplexerDemoImage from "../../res/sprites/building_tutorials/multiplexer.png";
import demultiplexerDemoImage from "../../res/sprites/building_tutorials/multiplexer-demuxer.png";

export class MetaMultiplexerBuilding extends ModMetaBuilding {
    constructor() {
        super("multiplexer");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Multiplexer",
                description: "Select from the two bottom inputs using a boolean on the right input.",
                tutorialImageBase64: multiplexerDemoImage,
            },
            {
                variant: enumMultiplexerType.demuxer,
                name: "Demultiplexer",
                description: "Select from the two outputs using a boolean on the right input.",
                tutorialImageBase64: demultiplexerDemoImage,
            },
        ];
    }
    getSilhouetteColor() {
        return "#FF75FC";
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumMultiplexerType.demuxer];
    }
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_logic_gates);
    }
    getLayer() {
        return "wires";
    }
    getDimensions() {
        return new Vector(2, 1);
    }
    getRenderPins() {
        return false;
    }
    updateVariants(entity, rotationVariant, variant) {
        const muxerType = enumMultiplexerType[variant];
        entity.components.Multiplexer.type = muxerType;

        const pinComp = entity.components.WiredPins;

        switch (variant) {
            case defaultBuildingVariant:
                pinComp.setSlots([
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalAcceptor,
                    },
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
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ]);
                break;
            case enumMultiplexerType.demuxer:
                pinComp.setSlots([
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.right,
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
        }
    }
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [],
            })
        );

        entity.addComponent(new MultiplexerComponent({}));
    }
}
