import { MetaAnalyzerBuilding } from "shapez/game/buildings/analyzer";
import { isModLoaded } from "../utils";
import { Vector, enumDirection } from "shapez/core/vector";
import { enumPinSlotType } from "shapez/game/components/wired_pins";
import { generateMatrixRotations } from "shapez/core/utils";
import { unCombineDefinitions } from "../compat/shapez_industries";
import { LogicGateSystem } from "shapez/game/systems/logic_gate";

export function patchAnalyzer() {
    if (isModLoaded("shapez-industries")) {
        this.modInterface.addVariantToExistingBuilding(MetaAnalyzerBuilding, "uncombiner", {
            name: "Virtual UnCombiner",
            description: "UnCombine the top right quadrant of the lowest layer of the shape and returns two uncolor shapes.",
            isUnlocked(root) {
                return root.hubGoals.isRewardUnlocked("reward_shape_combiner");
            },
        });

        this.modInterface.extendClass(MetaAnalyzerBuilding, ({ $old }) => ({
            updateVariants(entity, rotationVariant, variant) {
                entity.components.LogicGate.type = "uncombiner";
                entity.components.WiredPins.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
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
            },
            getSilhouetteColor(variant) {
                return "#0b8005";
            },
            getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
                return generateMatrixRotations([0, 0, 0, 1, 1, 1, 0, 1, 0]);
            },
        }));

        const toExtend = {
            compute_UNCOMBINE(parameters) {
                const first = parameters[0];
                if (!first || first.getItemType() !== "shape") {
                    return [null, null];
                }

                const firstDefinition = first.definition;
                const unCombinedDefinition = unCombineDefinitions(firstDefinition);
                return [this.root.shapeDefinitionMgr.getShapeItemFromDefinition(unCombinedDefinition[0]),
                    this.root.shapeDefinitionMgr.getShapeItemFromDefinition(unCombinedDefinition[1])];
            },
        };

        this.modInterface.extendClass(LogicGateSystem, ({ $old }) => toExtend);
    
        this.signals.gameInitialized.add(root => {
                const siUnCombiner = root.systemMgr.systems.logicGate.compute_UNCOMBINE.bind(root.systemMgr.systems.logicGate);
                root.systemMgr.systems.logicGate.boundOperations["uncombiner"] = siUnCombiner;
        });
    }
}
