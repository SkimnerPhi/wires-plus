const { Vector, enumDirection } = require("shapez/core/vector");
const { enumPinSlotType, WiredPinsComponent } = require("shapez/game/components/wired_pins");
const { defaultBuildingVariant } = require("shapez/game/meta_building");
const { enumHubGoalRewards } = require("shapez/game/tutorial_goals");
const { ModMetaBuilding } = require("shapez/mods/mod_meta_building");
const { enumVxMixerType, VirtualMixerComponent } = require("../components/virtual_mixer");

import mixerBaseImage from "../res/sprites/buildings/virtual_mixer.png";
import mixerGhostImage from "../res/sprites/blueprints/virtual_mixer.png";
import unmixerBaseImage from "../res/sprites/buildings/virtual_unmixer.png";
import unmixerGhostImage from "../res/sprites/blueprints/virtual_unmixer.png";

export class MetaVirtualMixerBuilding extends ModMetaBuilding {
    constructor() {
        super("virtualMixer");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Virtual Mixer",
                description: "Compute a color from three boolean channels",
                regularImageBase64: mixerBaseImage,
                blueprintImageBase64: mixerGhostImage,
                tutorialImageBase64: mixerBaseImage,
            },
            {
                variant: enumVxMixerType.unmixer,
                name: "Virtual Unmixer",
                description: "Split a color to three boolean channels",
                regularImageBase64: unmixerBaseImage,
                blueprintImageBase64: unmixerGhostImage,
                tutorialImageBase64: unmixerBaseImage,
            },
        ];
    }
    getSilhouetteColor() {
        return "#FFA300";
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumVxMixerType.unmixer];
    }
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing);
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
        const vxMixerType = enumVxMixerType[variant];
        entity.components.VirtualMixer.type = vxMixerType;

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
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ]);
                break;
            case enumVxMixerType.unmixer:
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
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
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

        entity.addComponent(new VirtualMixerComponent({}));
    }
}
