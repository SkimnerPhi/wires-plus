import { Mod } from "shapez/mods/mod";
import { patchLogicGate } from "./patches/logic_gate";
import { patchWire } from "./patches/wire";

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

class ModImpl extends Mod {
    init() {
        patchLogicGate.call(this);
        patchWire.call(this);

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
