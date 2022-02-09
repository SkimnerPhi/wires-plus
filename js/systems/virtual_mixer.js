import { enumColors } from "shapez/game/colors";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { COLOR_ITEM_SINGLETONS } from "shapez/game/items/color_item";
import { VirtualMixerComponent, enumVxMixerType } from "../components/virtual_mixer";
import { castBool } from "../utils";

export const enumColorToNumber = {
    [enumColors.uncolored]: 0,
    [enumColors.blue]: 1,
    [enumColors.green]: 2,
    [enumColors.cyan]: 3,
    [enumColors.red]: 4,
    [enumColors.purple]: 5,
    [enumColors.yellow]: 6,
    [enumColors.white]: 7,
};
export const enumNumberToColor = [
    enumColors.uncolored,
    enumColors.blue,
    enumColors.green,
    enumColors.cyan,
    enumColors.red,
    enumColors.purple,
    enumColors.yellow,
    enumColors.white,
];

export class VirtualMixerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [VirtualMixerComponent]);
    }
    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const vxMixerComp = entity.components.VirtualMixer;
            const slotComp = entity.components.WiredPins;

            switch (vxMixerComp.type) {
                case enumVxMixerType.mixer: {
                    let colorCodeIn = 0;
                    let anyConflict = false;

                    for (let ch = 0; ch < 3; ch++) {
                        const inputPin = slotComp.slots[ch];
                        const inputNetwork = inputPin.linkedNetwork;
                        if (inputNetwork?.valueConflict) {
                            anyConflict = true;
                            break;
                        }
                        // @ts-ignore
                        colorCodeIn |= isTruthyItem(inputNetwork?.currentValue) << ch;
                    }

                    slotComp.slots[3].value = anyConflict
                        ? null
                        : COLOR_ITEM_SINGLETONS[enumNumberToColor[colorCodeIn]];

                    break;
                }
                case enumVxMixerType.unmixer: {
                    const inputPin = slotComp.slots[0];
                    if (!inputPin.linkedNetwork || inputPin.linkedNetwork.valueConflict) {
                        for (let ch = 0; ch < 3; ch++) {
                            slotComp.slots[ch + 1].value = null;
                        }
                        continue;
                    }

                    const inputValue = inputPin.linkedNetwork.currentValue;

                    if (!inputValue || inputValue.getItemType() !== "color") {
                        for (let ch = 0; ch < 3; ch++) {
                            slotComp.slots[ch + 1].value = null;
                        }
                        continue;
                    }

                    const colorCodeOut = enumColorToNumber[inputValue.color];
                    for (let ch = 0; ch < 3; ch++) {
                        slotComp.slots[ch + 1].value = castBool((colorCodeOut >> ch) & 0x1);
                    }

                    break;
                }
            }
        }
    }
}
