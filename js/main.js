import { Mod } from "shapez/mods/mod";

import { patchLogicGate } from "./patches/logic_gate";
import { patchConstantSignal } from "./patches/constant_signal";
import { patchWire } from "./patches/wire";
import { patchWireTunnel } from "./patches/wire_tunnel";
import { patchWireSystem } from "./patches/wire_system";
import { patchGameLogic } from "./patches/game_logic";

import { MetaAdderBuilding } from "./buildings/adder";
import { MetaAdvancedProcessorBuilding } from "./buildings/advanced_processor";
import { MetaDiodeBuilding } from "./buildings/diode";
import { MetaEdgeDetectorBuilding } from "./buildings/edge_detector";
import { MetaMemoryBuilding } from "./buildings/memory";
import { MetaMultiplexerBuilding } from "./buildings/multiplexer";

import { AdderComponent } from "./components/adder";
import { ColorProcessorComponent } from "./components/color_processor";
import { DiodeComponent } from "./components/diode";
import { EdgeDetectorComponent } from "./components/edge_detector";
import { MemoryComponent } from "./components/memory";
import { MultiplexerComponent } from "./components/multiplexer";
import { RandomSignalComponent } from "./components/random_signal";
import { SmartProcessorComponent } from "./components/smart_processor";
import { VirtualMixerComponent } from "./components/virtual_mixer";
import { WireInsulatorComponent } from "./components/wire_insulator";

import { AdderSystem } from "./systems/adder";
import { ColorProcessorSystem } from "./systems/color_processor";
import { DiodeSystem } from "./systems/diode";
import { EdgeDetectorSystem } from "./systems/edge_detector";
import { MemorySystem } from "./systems/memory";
import { MultiplexerSystem } from "./systems/multiplexer";
import { RandomSignalSystem } from "./systems/random_signal";
import { SmartProcessorSystem } from "./systems/smart_processor";
import { VirtualMixerSystem } from "./systems/virtual_mixer";

import adderIcon from "../res/sprites/building_icons/adder.png";
import advancedProcessorIcon from "../res/sprites/building_icons/advanced_processor.png";
import diodeIcon from "../res/sprites/building_icons/diode.png";
import edgeDetectorIcon from "../res/sprites/building_icons/edge_detector.png";
import memoryIcon from "../res/sprites/building_icons/memory.png";
import multiplexerIcon from "../res/sprites/building_icons/multiplexer.png";

import META from "../mod.json";
import { isModLoaded } from "./utils";
import { WireInsulatorElement } from "./elements/wire_insulator";


class ModImpl extends Mod {
    init() {
        patchLogicGate.call(this);
        patchConstantSignal.call(this);
        patchWire.call(this);
        patchWireTunnel.call(this);
        patchWireSystem.call(this);

        this.component(AdderComponent);
        this.component(ColorProcessorComponent);
        this.component(DiodeComponent);
        this.component(EdgeDetectorComponent);
        this.component(MemoryComponent);
        this.component(MultiplexerComponent);
        this.component(RandomSignalComponent);
        this.component(SmartProcessorComponent);
        this.component(VirtualMixerComponent);
        this.component(WireInsulatorComponent);

        this.building(MetaAdvancedProcessorBuilding, {
            icon: advancedProcessorIcon,
        }, "AdvancedProcessor");
        this.building(MetaMultiplexerBuilding, {
            icon: multiplexerIcon,
        }, "Multiplexer");
        this.building(MetaMemoryBuilding, {
            icon: memoryIcon,
        }, "Memory");
        this.building(MetaAdderBuilding, {
            icon: adderIcon,
        }, "Adder");
        this.building(MetaDiodeBuilding, {
            icon: diodeIcon,
            location: "secondary",
        }, "Diode");
        this.building(MetaEdgeDetectorBuilding, {
            icon: edgeDetectorIcon,
            location: "secondary",
        }, "EdgeDetector");

        this.system(AdderSystem, "Adder");
        this.system(ColorProcessorSystem, "ColorProcessor");
        this.system(DiodeSystem, "Diode");
        this.system(EdgeDetectorSystem, "EdgeDetector");
        this.system(MemorySystem, "Memory");
        this.system(MultiplexerSystem, "Multiplexer");
        this.system(RandomSignalSystem, "RandomSignal");
        this.system(SmartProcessorSystem, "SmartProcessor");
        this.system(VirtualMixerSystem, "VirtualMixer");

        this.signals.appBooted.add(root => {
            const nb = ModExtras.require("network-buddy", "^1.0.0");
            
            nb.registerNetworkElement(WireInsulatorElement);
        });
    }

    component(component) {
        const name = component.getId() + "Component";
        this[name] = component;
        this.modInterface.registerComponent(component);
    }
    building(metaClass, { icon, toolbar = "wires", location = "primary" }, name) {
        this[`Meta${name}Building`] = metaClass;
        this.modInterface.registerNewBuilding({
            metaClass,
            buildingIconBase64: icon,
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar,
            location,
            metaClass,
        });
    }
    system(systemClass, name, before = "end") {
        const id = name.charAt(0).toLowerCase() + name.slice(1);
        this[name + "System"] = systemClass;
        this.modInterface.registerGameSystem({
            id,
            systemClass,
            before,
        });
    }
    hudElement(id, hudElement) {
        const name = "HUD" + id.charAt(0).toUpperCase() + id.slice(1);
        this[name] = hudElement;
        this.modInterface.registerHudElement(id, hudElement);
    }
}