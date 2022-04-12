import { enumColorMixingResults, enumColors } from "shapez/game/colors";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { COLOR_ITEM_SINGLETONS } from "shapez/game/items/color_item";
import { ColorProcessorComponent, enumColorProcessorType } from "../components/color_processor";

shapez.enumSpecialColorUnmixingResults ??= {};
const whiteUnmixing = (shapez.enumSpecialColorUnmixingResults[enumColors.white] ??= {});
whiteUnmixing[enumColors.cyan] ??= enumColors.red;
whiteUnmixing[enumColors.yellow] ??= enumColors.blue;
whiteUnmixing[enumColors.purple] ??= enumColors.green;

export class ColorProcessorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ColorProcessorComponent]);
    }
    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const colorComp = entity.components.ColorProcessor;
            const slotComp = entity.components.WiredPins;

            const baseNetwork = slotComp.slots[0].linkedNetwork;
            const modNetwork = slotComp.slots[1].linkedNetwork;

            if (!baseNetwork || !modNetwork) {
                slotComp.slots[2].value = null;
                continue;
            }
            if (baseNetwork.valueConflict || modNetwork.valueConflict) {
                slotComp.slots[2].value = null;
                continue;
            }

            const isBaseColor = baseNetwork.currentValue?.getItemType() === "color";
            const isModColor = modNetwork.currentValue?.getItemType() === "color";

            if (!isBaseColor || !isModColor) {
                slotComp.slots[2].value = null;
                continue;
            }

            const baseColor = baseNetwork.currentValue.color;
            const modColor = modNetwork.currentValue.color;

            switch (colorComp.type) {
                case enumColorProcessorType.adder: {
                    const result = enumColorMixingResults[baseColor][modColor];

                    slotComp.slots[2].value = COLOR_ITEM_SINGLETONS[result];
                    break;
                }
                case enumColorProcessorType.subtractor: {
                    if (baseColor === modColor) {
                        slotComp.slots[2].value = COLOR_ITEM_SINGLETONS[enumColors.uncolored];
                        break;
                    }
                    if (shapez.enumSpecialColorUnmixingResults) {
                        const result = shapez.enumSpecialColorUnmixingResults[baseColor]?.[modColor];
                        if (result) {
                            slotComp.slots[2].value = COLOR_ITEM_SINGLETONS[result];
                            break;
                        }
                    }

                    const modMixing = enumColorMixingResults[modColor];
                    if (!modMixing) {
                        slotComp.slots[2].value = null;
                        break;
                    }

                    const result = Object.keys(modMixing).find(c => modMixing[c] === baseColor);
                    slotComp.slots[2].value = COLOR_ITEM_SINGLETONS[result];
                    break;
                }
            }
        }
    }
}
