import { Mod } from "shapez/mods/mod";
import { enumVirtualProcessorVariants, MetaVirtualProcessorBuilding } from "shapez/game/buildings/virtual_processor";
import { enumLogicGateType } from "shapez/game/components/logic_gate";
import { enumDirection, Vector } from "shapez/core/vector";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { LogicGateSystem } from "shapez/game/systems/logic_gate";

import { MetaAdderBuilding } from "./buildings/adder";
import { MetaAdvancedProcessorBuilding } from "./buildings/advanced_processor";
import { MetaDiodeBuilding } from "./buildings/diode";
import { MetaEdgeDetectorBuilding } from "./buildings/edge_detector";
import { MetaMemoryBuilding } from "./buildings/memory";
import { MetaMultiplexerBuilding } from "./buildings/multiplexer";

import { AdderComponent } from "./components/adder";
import { DiodeComponent } from "./components/diode";
import { EdgeDetectorComponent } from "./components/edge_detector";
import { MemoryComponent } from "./components/memory";
import { MultiplexerComponent } from "./components/multiplexer";
import { SmartProcessorComponent } from "./components/smart_processor";
import { VirtualMixerComponent } from "./components/virtual_mixer";

import { AdderSystem } from "./systems/adder";
import { DiodeSystem } from "./systems/diode";
import { EdgeDetectorSystem } from "./systems/edge_detector";
import { MemorySystem } from "./systems/memory";
import { MultiplexerSystem } from "./systems/multiplexer";
import { SmartProcessorSystem } from "./systems/smart_processor";
import { VirtualMixerSystem } from "./systems/virtual_mixer";

import adderIcon from "../res/sprites/building_icons/adder.png";
import advancedProcessorIcon from "../res/sprites/building_icons/advanced_processor.png";
import diodeIcon from "../res/sprites/building_icons/diode.png";
import edgeDetectorIcon from "../res/sprites/building_icons/edge_detector.png";
import memoryIcon from "../res/sprites/building_icons/memory.png";
import multiplexerIcon from "../res/sprites/building_icons/multiplexer.png";

import META from "../mod.json";
import { enumPinSlotType } from "shapez/game/components/wired_pins";
import { ShapeItem } from "shapez/game/items/shape_item";
import { defaultBuildingVariant } from "shapez/game/meta_building";

class ModImpl extends Mod {
    init() {
        enumVirtualProcessorVariants.rotaterCCW = "rotater_ccw";
        enumVirtualProcessorVariants.rotater180 = "rotater_180";
        enumLogicGateType.rotaterCCW = "rotater_ccw";
        enumLogicGateType.rotater180 = "rotater_180";
        const enumVariantToGate = {
            [defaultBuildingVariant]: enumLogicGateType.cutter,
            [enumVirtualProcessorVariants.rotater]: enumLogicGateType.rotater,
            [enumVirtualProcessorVariants.rotaterCCW]: enumLogicGateType.rotaterCCW,
            [enumVirtualProcessorVariants.rotater180]: enumLogicGateType.rotater180,
            [enumVirtualProcessorVariants.unstacker]: enumLogicGateType.unstacker,
            [enumVirtualProcessorVariants.stacker]: enumLogicGateType.stacker,
            [enumVirtualProcessorVariants.painter]: enumLogicGateType.painter,
        }

        this.modInterface.addVariantToExistingBuilding(
            MetaVirtualProcessorBuilding,
            enumVirtualProcessorVariants.rotaterCCW,
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
            enumVirtualProcessorVariants.rotater180,
            {
                name: "Virtual Rotator (180°)",
                description: "Virtually rotates the shape 180 degrees.",
                isUnlocked() {
                    return true;
                }
            }
        );
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
                    case enumLogicGateType.rotaterCCW:
                    case enumLogicGateType.rotater180: {
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
                    default:
                        assertAlways("unknown logic gate type: " + gateType);
                }
            }
        }));
        this.modInterface.extendClass(LogicGateSystem, ({ $old }) => ({
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
        }));

        this.signals.gameInitialized.add(root => {
            const rCCW = root.systemMgr.systems.logicGate.compute_ROTATE_CCW.bind(root.systemMgr.systems.logicGate);
            root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.rotaterCCW] = rCCW;

            const r180 = root.systemMgr.systems.logicGate.compute_ROTATE_180.bind(root.systemMgr.systems.logicGate);
            root.systemMgr.systems.logicGate.boundOperations[enumLogicGateType.rotater180] = r180;
        });

        this.modInterface.registerComponent(AdderComponent);
        this.modInterface.registerComponent(DiodeComponent);
        this.modInterface.registerComponent(EdgeDetectorComponent);
        this.modInterface.registerComponent(MemoryComponent);
        this.modInterface.registerComponent(MultiplexerComponent);
        this.modInterface.registerComponent(SmartProcessorComponent);
        this.modInterface.registerComponent(VirtualMixerComponent);

        this.modInterface.registerNewBuilding({
            metaClass: MetaAdderBuilding,
            buildingIconBase64: adderIcon,
        });
        this.modInterface.registerNewBuilding({
            metaClass: MetaDiodeBuilding,
            buildingIconBase64: diodeIcon,
        });
        this.modInterface.registerNewBuilding({
            metaClass: MetaEdgeDetectorBuilding,
            buildingIconBase64: edgeDetectorIcon,
        });
        this.modInterface.registerNewBuilding({
            metaClass: MetaMemoryBuilding,
            buildingIconBase64: memoryIcon,
        });
        this.modInterface.registerNewBuilding({
            metaClass: MetaMultiplexerBuilding,
            buildingIconBase64: multiplexerIcon,
        });
        this.modInterface.registerNewBuilding({
            metaClass: MetaAdvancedProcessorBuilding,
            buildingIconBase64: advancedProcessorIcon,
        });

        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "primary",
            metaClass: MetaAdderBuilding,
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "secondary",
            metaClass: MetaDiodeBuilding,
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "primary",
            metaClass: MetaMultiplexerBuilding,
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "primary",
            metaClass: MetaMemoryBuilding,
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "primary",
            metaClass: MetaAdvancedProcessorBuilding,
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "primary",
            metaClass: MetaEdgeDetectorBuilding,
        });

        this.modInterface.registerGameSystem({
            id: "adder",
            systemClass: AdderSystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "delay",
            systemClass: DiodeSystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "edge_detector",
            systemClass: EdgeDetectorSystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "memory",
            systemClass: MemorySystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "multiplexer",
            systemClass: MultiplexerSystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "smart_processor",
            systemClass: SmartProcessorSystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "virtual_mixer",
            systemClass: VirtualMixerSystem,
            before: "end",
        });
    }
}
