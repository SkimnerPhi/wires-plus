import { Vector, enumDirection } from "shapez/core/vector";
import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { MetaPainterBuilding } from "shapez/game/buildings/painter";
import { MetaCutterBuilding } from "shapez/game/buildings/cutter";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { enumPinSlotType, WiredPinsComponent } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { enumVxMixerType, VirtualMixerComponent } from "../components/virtual_mixer";
import { enumSmartProcessorType, SmartProcessorComponent } from "../components/smart_processor";
import { generateMatrixRotations } from "shapez/core/utils";
import { ColorProcessorComponent, enumColorProcessorType } from "../components/color_processor";
import { isModSafeRewardUnlocked } from "../utils";

const colors = {
    [defaultBuildingVariant]: new MetaMixerBuilding().getSilhouetteColor(),
    [enumVxMixerType.unmixer]: new MetaMixerBuilding().getSilhouetteColor(),
    [enumSmartProcessorType.stacker]: new MetaStackerBuilding().getSilhouetteColor(),
    [enumSmartProcessorType.painter]: new MetaPainterBuilding().getSilhouetteColor(),
   // [enumSmartProcessorType.nipper]: new MetaCutterBuilding().getSilhoutetteColor(),
    [enumColorProcessorType.adder]: new MetaMixerBuilding().getSilhouetteColor(),
    [enumColorProcessorType.subtractor]: new MetaMixerBuilding().getSilhouetteColor(),
};

const overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
    [enumVxMixerType.unmixer]: generateMatrixRotations([1, 1, 1, 1, 0, 1, 0, 1, 0]),
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
            },
            {
                variant: enumVxMixerType.unmixer,
                name: "Virtual Unmixer",
                description: "Split a color to three boolean channels.",
            },
            {
                variant: enumSmartProcessorType.stacker,
                name: "Smart Stacker",
                description: "Virtually stacks the right shape onto the left, or just outputs the input shape otherwise.",
            },
            {
                variant: enumSmartProcessorType.painter,
                name: "Smart Painter",
                description: "Virtually paints the shape from the bottom input with the color on the right input, or just outputs the input shape otherwise.",
            },
            {
                variant: enumSmartProcessorType.nipper,
                name: "Nipper",
                description: "Virtually removes the top right corner from the input shape and outputs the rest."
            },
            {
                variant: enumColorProcessorType.adder,
                name: "Color Adder",
                description: "Compute a color by adding together two input colors.",
            },
            {
                variant: enumColorProcessorType.subtractor,
                name: "Color Subtractor",
                description: "Compute a color by subtracting the color from the right input from the color on the bottom input.",
            }
        ];
    }
    getSilhouetteColor(variant) {
        return colors[variant];
    }
    getAvailableVariants(root) {
        return [
            defaultBuildingVariant,
            enumVxMixerType.unmixer,
            enumSmartProcessorType.stacker,
            enumSmartProcessorType.painter,
            enumSmartProcessorType.nipper,
            enumColorProcessorType.adder,
            enumColorProcessorType.subtractor,
        ];
    }
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
        return overlayMatrices[variant]?.[rotation];
    }
    getIsUnlocked(root) {
        return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_virtual_processing);
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
                if(entity.components.SmartProcessor) {
                    entity.removeComponent(SmartProcessorComponent);
                }
                if(entity.components.ColorProcessor) {
                    entity.removeComponent(ColorProcessorComponent);
                }
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
                if(entity.components.SmartProcessor) {
                    entity.removeComponent(SmartProcessorComponent);
                }
                if(entity.components.ColorProcessor) {
                    entity.removeComponent(ColorProcessorComponent);
                }
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
                if(entity.components.VirtualMixer) {
                    entity.removeComponent(VirtualMixerComponent);
                }
                if(entity.components.ColorProcessor) {
                    entity.removeComponent(ColorProcessorComponent);
                }
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
            case enumSmartProcessorType.nipper: {
                if(entity.components.VirtualMixer) {
                    entity.removeComponent(VirtualMixerComponent);
                }
                if(entity.components.ColorProcessor) {
                    entity.removeComponent(ColorProcessorComponent);
                }
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
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                ]);
                break;
            }
            case enumColorProcessorType.adder: 
            case enumColorProcessorType.subtractor: {
                if(entity.components.VirtualMixer) {
                    entity.removeComponent(VirtualMixerComponent);
                }
                if(entity.components.SmartProcessor) {
                    entity.removeComponent(SmartProcessorComponent);
                }
                if(!entity.components.ColorProcessor) {
                    entity.addComponent(new ColorProcessorComponent({}));
                }
                const colorType = enumColorProcessorType[variant];
                entity.components.ColorProcessor.type = colorType;
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
