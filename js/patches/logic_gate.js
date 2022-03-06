import { generateMatrixRotations } from "shapez/core/utils";
import { Vector, enumDirection } from "shapez/core/vector";
import { MetaCutterBuilding } from "shapez/game/buildings/cutter";
import { MetaPainterBuilding } from "shapez/game/buildings/painter";
import { MetaRotaterBuilding } from "shapez/game/buildings/rotater";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { enumVirtualProcessorVariants, MetaVirtualProcessorBuilding } from "shapez/game/buildings/virtual_processor";
import { enumLogicGateType } from "shapez/game/components/logic_gate";
import { enumPinSlotType } from "shapez/game/components/wired_pins";
import { ShapeItem } from "shapez/game/items/shape_item";
import { itemResolverSingleton } from "shapez/game/item_resolver";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { LogicGateSystem } from "shapez/game/systems/logic_gate";
import { isModLoaded } from "../utils";
import { combineDefinitions, shapeActionCompress } from "../compat/shapez_industries";

export function patchLogicGate() {
    const addToEnum = {
        rotater_ccw: "rotater_ccw",
        rotater_180: "rotater_180",
    };
    Object.assign(enumVirtualProcessorVariants, addToEnum);
    Object.assign(enumLogicGateType, addToEnum);


    const enumVariantToGate = {
        [defaultBuildingVariant]: enumLogicGateType.cutter,
        [enumVirtualProcessorVariants.rotater]: enumLogicGateType.rotater,
        [enumVirtualProcessorVariants.rotater_ccw]: enumLogicGateType.rotater_ccw,
        [enumVirtualProcessorVariants.rotater_180]: enumLogicGateType.rotater_180,
        [enumVirtualProcessorVariants.unstacker]: enumLogicGateType.unstacker,
        [enumVirtualProcessorVariants.stacker]: enumLogicGateType.stacker,
        [enumVirtualProcessorVariants.painter]: enumLogicGateType.painter,
    };

    const colors = {
        [defaultBuildingVariant]: new MetaCutterBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.rotater]: new MetaRotaterBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.rotater_ccw]: new MetaRotaterBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.rotater_180]: new MetaRotaterBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.unstacker]: new MetaStackerBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.stacker]: new MetaStackerBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.painter]: new MetaPainterBuilding().getSilhouetteColor(),
    };

    const overlayMatrices = {
        [enumVirtualProcessorVariants.rotater]: generateMatrixRotations([0, 1, 1, 1, 1, 0, 0, 1, 1]),
        [enumVirtualProcessorVariants.rotater_ccw]: generateMatrixRotations([1, 1, 0, 0, 1, 1, 1, 1, 0]),
        [enumVirtualProcessorVariants.rotater_180]: generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]),
    };

    if(isModLoaded("shapez-industries")) {
        const addVariants = {
            combiner: "combiner",
            compressor: "compressor",
        };
        Object.assign(enumVirtualProcessorVariants, addVariants);
        Object.assign(enumLogicGateType, addVariants);
        Object.assign(enumVariantToGate, addVariants);

        const addColors = {
            [enumVirtualProcessorVariants.combiner]: "#0b8005",
            [enumVirtualProcessorVariants.compressor]: "#0b8005",
        };
        Object.assign(colors, addColors);

        const addMatrices = {
            [enumVirtualProcessorVariants.combiner]: generateMatrixRotations([1, 1, 1, 1, 1, 1, 1, 1, 1]),
            [enumVirtualProcessorVariants.compressor]: generateMatrixRotations([1, 1, 1, 0, 1, 0, 1, 1, 1]),
        };
        Object.assign(overlayMatrices, addMatrices);
    }

    this.modInterface.addVariantToExistingBuilding(
        MetaVirtualProcessorBuilding,
        enumVirtualProcessorVariants.rotater_ccw,
        {
            name: "Virtual Rotator (CCW)",
            description: "Virtually rotates the shape clockwise.",
            isUnlocked() {
                return true;
            }
        }
    );
    this.modInterface.addVariantToExistingBuilding(
        MetaVirtualProcessorBuilding,
        enumVirtualProcessorVariants.rotater_180,
        {
            name: "Virtual Rotator (180°)",
            description: "Virtually rotates the shape 180 degrees.",
            isUnlocked() {
                return true;
            }
        }
    );
    if(isModLoaded("shapez-industries")) {
        this.modInterface.addVariantToExistingBuilding(
            MetaVirtualProcessorBuilding,
            enumVirtualProcessorVariants.combiner,
            {
                name: "Virtual Combiner",
                description: "Virtually merges two shapes into one combined shape.",
                isUnlocked(root) {
                    return root.hubGoals.isRewardUnlocked("reward_shape_combiner");
                }
            }
        );
        this.modInterface.addVariantToExistingBuilding(
            MetaVirtualProcessorBuilding,
            enumVirtualProcessorVariants.compressor,
            {
                name: "Virtual Smelter",
                description: "Virtually compresses shape layers into one. Removes color while processing.",
                isUnlocked(root) {
                    return root.hubGoals.isRewardUnlocked("reward_shape_compressor");
                }
            }
        );
    }

    this.modInterface.extendClass(MetaVirtualProcessorBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            const gateType = enumVariantToGate[variant];
            entity.components.LogicGate.type = gateType;
            const pinComp = entity.components.WiredPins;
            switch (gateType) {
                case enumLogicGateType.cutter:
                case enumLogicGateType.unstacker: {
                    pinComp.setSlots([
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
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                            type: enumPinSlotType.logicalAcceptor,
                        },
                    ]);
                    break;
                }
                case enumLogicGateType.rotater:
                case enumLogicGateType.rotater_ccw:
                case enumLogicGateType.rotater_180:
                case enumLogicGateType.compressor: {
                    pinComp.setSlots([
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top,
                            type: enumPinSlotType.logicalEjector,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                            type: enumPinSlotType.logicalAcceptor,
                        },
                    ]);
                    break;
                }
                case enumLogicGateType.stacker:
                case enumLogicGateType.painter: {
                    pinComp.setSlots([
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top,
                            type: enumPinSlotType.logicalEjector,
                        },
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
                    ]);
                    break;
                }
                case enumLogicGateType.combiner: {
                    pinComp.setSlots([
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top,
                            type: enumPinSlotType.logicalEjector,
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
                    ]);
                    break;
                }
                default:
                    assertAlways("unknown logic gate type: " + gateType);
            }
        },
        getSilhouetteColor(variant) {
            return colors[variant];
        },
        getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
            return overlayMatrices[variant]?.[rotation];
        }
    }));
    const toExtend = {
        compute_ROTATE_CCW(parameters) {
            const item = parameters[0];
            if (!item || item.getItemType() !== "shape") {
                // Not a shape
                return null;
            }

            const definition = /** @type {ShapeItem} */ (item).definition;
            const rotatedDefinitionCW = this.root.shapeDefinitionMgr.shapeActionRotateCCW(definition);
            return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(rotatedDefinitionCW);
        },
        compute_ROTATE_180(parameters) {
            const item = parameters[0];
            if (!item || item.getItemType() !== "shape") {
                // Not a shape
                return null;
            }

            const definition = /** @type {ShapeItem} */ (item).definition;
            const rotatedDefinitionCW = this.root.shapeDefinitionMgr.shapeActionRotate180(definition);
            return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(rotatedDefinitionCW);
        },
    };
    if(isModLoaded("shapez-industries")) {
        toExtend.compute_COMBINE = function(parameters) {
            const first = parameters[0];
            if (!first || first.getItemType() !== "shape") {
                return null;
            }

            const second = parameters[1];
            if (!second || second.getItemType() !== "shape") {
                return null;
            }

            const firstDefinition = first.definition;
            const secondDefinition = second.definition;
            const combinedDefinition = combineDefinitions(firstDefinition, secondDefinition);
            return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(combinedDefinition);
        };
        toExtend.compute_COMPRESS = function(parameters) {
            const item = parameters[0];
            if (!item || item.getItemType() !== "shape") {
                return null;
            }

            const definition = item.definition;
            const compressedDefinition = shapeActionCompress(this.root, definition);

            return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(compressedDefinition);
        };
    }
    this.modInterface.extendClass(LogicGateSystem, ({ $old }) => toExtend);

    this.signals.gameInitialized.add(root => {
        const rCCW = root.systemMgr.systems.logicGate.compute_ROTATE_CCW.bind(root.systemMgr.systems.logicGate);
        root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.rotater_ccw] = rCCW;

        const r180 = root.systemMgr.systems.logicGate.compute_ROTATE_180.bind(root.systemMgr.systems.logicGate);
        root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.rotater_180] = r180;

        if(isModLoaded("shapez-industries")) {
            const siCombiner = root.systemMgr.systems.logicGate.compute_COMBINE.bind(root.systemMgr.systems.logicGate);
            root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.combiner] = siCombiner;
            
            const siCompressor = root.systemMgr.systems.logicGate.compute_COMPRESS.bind(root.systemMgr.systems.logicGate);
            root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.compressor] = siCompressor;
        }
    });
}