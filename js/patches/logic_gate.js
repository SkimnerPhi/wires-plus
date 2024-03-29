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
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { LogicGateSystem } from "shapez/game/systems/logic_gate";
import { isModLoaded } from "../utils";

export function patchLogicGate() {
    const addToEnum = {
        rotater_ccw: "rotater_ccw",
        rotater_180: "rotater_180",
    };
    Object.assign(enumVirtualProcessorVariants, addToEnum);
    Object.assign(enumLogicGateType, addToEnum);


    const enumVariantToGate = {
        [enumVirtualProcessorVariants.rotater_ccw]: enumLogicGateType.rotater_ccw,
        [enumVirtualProcessorVariants.rotater_180]: enumLogicGateType.rotater_180,
    };

    const colors = {
        [enumVirtualProcessorVariants.rotater_ccw]: new MetaRotaterBuilding().getSilhouetteColor(),
        [enumVirtualProcessorVariants.rotater_180]: new MetaRotaterBuilding().getSilhouetteColor(),
    };

    const overlayMatrices = {
        [enumVirtualProcessorVariants.rotater]: generateMatrixRotations([0, 1, 1, 1, 1, 0, 0, 1, 1]),
        [enumVirtualProcessorVariants.rotater_ccw]: generateMatrixRotations([1, 1, 0, 0, 1, 1, 1, 1, 0]),
        [enumVirtualProcessorVariants.rotater_180]: generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]),
    };

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

    this.modInterface.replaceMethod(MetaVirtualProcessorBuilding, "updateVariants", function($old, [entity, rotationVariant, variant]) {
        const gateType = enumVariantToGate[variant];
        entity.components.LogicGate.type = gateType;
        const pinComp = entity.components.WiredPins;
        switch (variant) {
            case enumLogicGateType.rotater_ccw:
            case enumLogicGateType.rotater_180: {
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
            default: {
                $old(entity, rotationVariant, variant);
                break;
            }
        }
    });
    this.modInterface.replaceMethod(MetaVirtualProcessorBuilding, "getSilhouetteColor", function($old, [variant]) {
        return colors[variant] ?? $old(variant);
    });

    this.modInterface.replaceMethod(MetaVirtualProcessorBuilding, "getSpecialOverlayRenderMatrix", function($old, [rotation, rotationVariant, variant]) {
        return overlayMatrices[variant]?.[rotation] ?? $old(rotation, rotationVariant, variant);
    });

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
    this.modInterface.extendClass(LogicGateSystem, ({ $old }) => toExtend);

    this.signals.gameInitialized.add(root => {
        const rCCW = root.systemMgr.systems.logicGate.compute_ROTATE_CCW.bind(root.systemMgr.systems.logicGate);
        root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.rotater_ccw] = rCCW;

        const r180 = root.systemMgr.systems.logicGate.compute_ROTATE_180.bind(root.systemMgr.systems.logicGate);
        root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.rotater_180] = r180;
    });
}