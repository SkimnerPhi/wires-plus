import { Vector, enumDirection } from "shapez/core/vector";
import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { MetaPainterBuilding } from "shapez/game/buildings/painter";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { enumPinSlotType, WiredPinsComponent } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumVxMixerType, VirtualMixerComponent } from "../components/virtual_mixer";
import { enumSmartProcessorType, SmartProcessorComponent } from "../components/smart_processor";

import mixerDemoImage from "../../res/sprites/building_tutorials/advanced_processor.png";
import unmixerDemoImage from "../../res/sprites/building_tutorials/advanced_processor-unmixer.png";
import stackerDemoImage from "../../res/sprites/building_tutorials/advanced_processor-stacker.png";
import painterDemoImage from "../../res/sprites/building_tutorials/advanced_processor-painter.png";

const colors = {
    [defaultBuildingVariant]: new MetaMixerBuilding().getSilhouetteColor(),
    [enumVxMixerType.mixer]: new MetaMixerBuilding().getSilhouetteColor(),
    [enumVxMixerType.unmixer]: new MetaMixerBuilding().getSilhouetteColor(),
    [enumSmartProcessorType.stacker]: new MetaStackerBuilding().getSilhouetteColor(),
    [enumSmartProcessorType.painter]: new MetaPainterBuilding().getSilhouetteColor(),
};

export class MetaAdvancedProcessorBuilding extends ModMetaBuilding {
    constructor() {
        super("advanced_processor");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Virtual Mixer",
                description: "Compute a color from three boolean channels.",
                tutorialImageBase64: mixerDemoImage,
            },
            {
                variant: enumVxMixerType.unmixer,
                name: "Virtual Unmixer",
                description: "Split a color to three boolean channels.",
                tutorialImageBase64: unmixerDemoImage,
            },
            {
                variant: enumSmartProcessorType.stacker,
                name: "Smart Stacker",
                description: "Virtually stacks the right shape onto the left, or just outputs the input shape otherwise.",
                tutorialImageBase64: stackerDemoImage,
            },
            {
                variant: enumSmartProcessorType.painter,
                name: "Smart Painter",
                description: "Virtually paints the shape from the bottom input with the color on the right input, or just outputs the input shape otherwise.",
                tutorialImageBase64: painterDemoImage,
            }
        ];
    }
    getSilhouetteColor(variant) {
        return colors[variant];
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumVxMixerType.unmixer, enumSmartProcessorType.stacker, enumSmartProcessorType.painter];
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
        const pinComp = entity.components.WiredPins;

        switch (variant) {
            case defaultBuildingVariant: {
                if(!entity.components.VirtualMixer) {
                    entity.addComponent(new VirtualMixerComponent({}));
                }
                const vxMixerType = enumVxMixerType[variant];
                entity.components.VirtualMixer.type = vxMixerType;
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
            }
            case enumVxMixerType.unmixer: {
                if(!entity.components.VirtualMixer) {
                    entity.addComponent(new VirtualMixerComponent({}));
                }
                const vxMixerType = enumVxMixerType[variant];
                entity.components.VirtualMixer.type = vxMixerType;
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
            case enumSmartProcessorType.stacker:
            case enumSmartProcessorType.painter: {
                if(!entity.components.SmartProcessor) {
                    entity.addComponent(new SmartProcessorComponent({}));
                }
                const smartType = enumSmartProcessorType[variant];
                entity.components.SmartProcessor.type = smartType;
                pinComp.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
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
            }
        }
    }
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [],
            })
        );
    }
}
