import { Mod } from "shapez/mods/mod";

import { patchLogicGate } from "./patches/logic_gate";
import { patchConstantSignal } from "./patches/constant_signal";
import { patchWire } from "./patches/wire";
import { patchWireTunnel } from "./patches/wire_tunnel";
import { patchWireSystem } from "./patches/wire_system";
import { patchGameLogic } from "./patches/game_logic";

import { MetaAdderBuilding } from "./buildings/adder";
import { MetaAdvancedProcessorBuilding } from "./buildings/advanced_processor";
import { MetaBundleBuilding } from "./buildings/bundle";
import { MetaDiodeBuilding } from "./buildings/diode";
import { MetaEdgeDetectorBuilding } from "./buildings/edge_detector";
import { MetaMemoryBuilding } from "./buildings/memory";
import { MetaMultiplexerBuilding } from "./buildings/multiplexer";

import { AdderComponent } from "./components/adder";
import { BundleComponent } from "./components/bundle";
import { BundleInterfaceComponent } from "./components/bundle_interface";
import { BundledPinsComponent } from "./components/bundled_pins";
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
import { BundleInterfaceSystem } from "./systems/bundle_interface";
import { BundledPinsSystem } from "./systems/bundled_pins";
import { ColorProcessorSystem } from "./systems/color_processor";
import { DiodeSystem } from "./systems/diode";
import { EdgeDetectorSystem } from "./systems/edge_detector";
import { MemorySystem } from "./systems/memory";
import { MultiplexerSystem } from "./systems/multiplexer";
import { RandomSignalSystem } from "./systems/random_signal";
import { SmartProcessorSystem } from "./systems/smart_processor";
import { VirtualMixerSystem } from "./systems/virtual_mixer";

import { HUDBundleInterfaceEdit } from "./hud/bundle_interface_edit";

import adderIcon from "../res/sprites/building_icons/adder.png";
import advancedProcessorIcon from "../res/sprites/building_icons/advanced_processor.png";
import bundleIcon from "../res/sprites/building_icons/bundle.png";
import diodeIcon from "../res/sprites/building_icons/diode.png";
import edgeDetectorIcon from "../res/sprites/building_icons/edge_detector.png";
import memoryIcon from "../res/sprites/building_icons/memory.png";
import multiplexerIcon from "../res/sprites/building_icons/multiplexer.png";

import META from "../mod.json";
import { isModLoaded } from "./utils";

class ModImpl extends Mod {
    init() {
        patchLogicGate.call(this);
        patchConstantSignal.call(this);
        patchWire.call(this);
        patchWireTunnel.call(this);
        patchWireSystem.call(this);
        patchGameLogic.call(this);

        this.component(AdderComponent);
        this.component(BundleComponent);
        this.component(BundleInterfaceComponent);
        this.component(BundledPinsComponent);
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
        });
        this.building(MetaMultiplexerBuilding, {
            icon: multiplexerIcon,
        });
        this.building(MetaMemoryBuilding, {
            icon: memoryIcon,
        });
        this.building(MetaAdderBuilding, {
            icon: adderIcon,
        });
        this.building(MetaDiodeBuilding, {
            icon: diodeIcon,
            location: "secondary",
        });
        this.building(MetaEdgeDetectorBuilding, {
            icon: edgeDetectorIcon,
            location: "secondary",
        });

        if (isModLoaded("wires-plus-plus")) {
            this.building(MetaBundleBuilding, {
                icon: bundleIcon,
                location: "secondary",
            });
        }

        this.system(AdderSystem);
        this.system(BundleInterfaceSystem);
        this.system(BundledPinsSystem);
        this.system(ColorProcessorSystem);
        this.system(DiodeSystem);
        this.system(EdgeDetectorSystem);
        this.system(MemorySystem);
        this.system(MultiplexerSystem);
        this.system(RandomSignalSystem);
        this.system(SmartProcessorSystem);
        this.system(VirtualMixerSystem);

        this.hudElement("bundleInterfaceEdit", HUDBundleInterfaceEdit);
    }

    component(component) {
        const name = component.name;
        this[name] = component;
        this.modInterface.registerComponent(component);
    }
    building(metaClass, { icon, toolbar = "wires", location = "primary" }) {
        const name = metaClass.name;
        this[name] = metaClass;
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
    system(systemClass, before = "end") {
        const name = systemClass.name;
        const id = name.replace("System", "").replace(/^\w/, (match) => match.toLowerCase());
        this[name] = systemClass;
        this.modInterface.registerGameSystem({
            id,
            systemClass,
            before,
        });
    }
    hudElement(id, hudElement) {
        const name = hudElement.name;
        this[name] = hudElement;
        this.modInterface.registerHudElement(id, hudElement);
    }
}