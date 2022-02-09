import { Mod } from "shapez/mods/mod";

import { MetaAdderBuilding } from "./buildings/adder";
import { MetaDiodeBuilding } from "./buildings/diode";
import { MetaEdgeDetectorBuilding } from "./buildings/edge_detector";
import { MetaMemoryBuilding } from "./buildings/memory";
import { MetaMultiplexerBuilding } from "./buildings/multiplexer";
import { MetaVirtualMixerBuilding } from "./buildings/virtual_mixer";

import { AdderComponent } from "./components/adder";
import { DiodeComponent } from "./components/diode";
import { EdgeDetectorComponent } from "./components/edge_detector";
import { MemoryComponent } from "./components/memory";
import { MultiplexerComponent } from "./components/multiplexer";
import { VirtualMixerComponent } from "./components/virtual_mixer";

import { AdderSystem } from "./systems/adder";
import { DiodeSystem } from "./systems/diode";
import { EdgeDetectorSystem } from "./systems/edge_detector";
import { MemorySystem } from "./systems/memory";
import { MultiplexerSystem } from "./systems/multiplexer";
import { VirtualMixerSystem } from "./systems/virtual_mixer";

import adderIcon from "./res/sprites/building_icons/adder.png";
import diodeIcon from "./res/sprites/building_icons/diode.png";
import edgeDetectorIcon from "./res/sprites/building_icons/edge_detector.png";
import memoryIcon from "./res/sprites/building_icons/memory.png";
import multiplexerIcon from "./res/sprites/building_icons/multiplexer.png";
import virtualMixerIcon from "./res/sprites/building_icons/virtual_mixer.png";

class ModImpl extends Mod {
    init() {
        this.modInterface.registerComponent(AdderComponent);
        this.modInterface.registerComponent(DiodeComponent);
        this.modInterface.registerComponent(EdgeDetectorComponent);
        this.modInterface.registerComponent(MemoryComponent);
        this.modInterface.registerComponent(MultiplexerComponent);
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
            metaClass: MetaVirtualMixerBuilding,
            buildingIconBase64: virtualMixerIcon,
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
            metaClass: MetaVirtualMixerBuilding,
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
            id: "virtualMixer",
            systemClass: VirtualMixerSystem,
            before: "end",
        });
        this.modInterface.registerGameSystem({
            id: "edgeDetector",
            systemClass: EdgeDetectorSystem,
            before: "end",
        });
    }
}
