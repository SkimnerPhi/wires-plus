import { Vector, enumDirection } from "shapez/core/vector";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { DiodeComponent, enumDiodeType } from "../components/diode";

export class MetaDiodeBuilding extends ModMetaBuilding {
    constructor() {
        super("diode");
    }
    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Diode",
                description: "A simple one-way gate.",
            },
            {
                variant: enumDiodeType.buffer,
                name: "Buffer",
                description: "Emits a boolean \"1\" if the input is truthy. (Truthy means shape, color, or boolean \"1\")",
            }
        ];
    }
    getSilhouetteColor() {
        return "#C6B88F";
    }
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumDiodeType.buffer];
    }
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_logic_gates);
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
        const diodeType = enumDiodeType[variant];
        entity.components.Diode.type = diodeType;
    }
    setupEntityComponents(entity) {
        entity.addComponent(
            new WiredPinsComponent({
                slots: [
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
                ],
            })
        );

        entity.addComponent(new DiodeComponent({}));
    }
}
