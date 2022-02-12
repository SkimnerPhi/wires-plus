import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { SmartProcessorComponent, enumSmartProcessorType } from "../components/smart_processor";

export class SmartProcessorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [SmartProcessorComponent]);
    }
    update() {
        for (let idx = 0; idx < this.allEntities.length; idx++) {
            const entity = this.allEntities[idx];
            const smartComp = entity.components.SmartProcessor;
            const slotComp = entity.components.WiredPins;

            switch (smartComp.type) {
                case enumSmartProcessorType.stacker: {
                    const bottomNetwork = slotComp.slots[0].linkedNetwork;
                    const topNetwork = slotComp.slots[1].linkedNetwork;

                    if(bottomNetwork?.valueConflict || topNetwork?.valueConflict) {
                        slotComp.slots[2].value = null;
                        break;
                    }

                    const isBottomShape = bottomNetwork?.currentValue?.getItemType() === "shape";
                    const isTopShape = topNetwork?.currentValue?.getItemType() === "shape";

                    if(isBottomShape && isTopShape) {
                        const stackedShape = this.root.shapeDefinitionMgr.shapeActionStack(
                            bottomNetwork.currentValue.definition,
                            topNetwork.currentValue.definition
                        );
                        slotComp.slots[2].value = this.root.shapeDefinitionMgr.getShapeItemFromDefinition(stackedShape);
                    } else if(isBottomShape) {
                        slotComp.slots[2].value = bottomNetwork.currentValue;
                    } else if(isTopShape) {
                        slotComp.slots[2].value = topNetwork.currentValue;
                    }

                    break;
                }
                case enumSmartProcessorType.painter: {
                    const shapeNetwork = slotComp.slots[0].linkedNetwork;
                    const colorNetwork = slotComp.slots[1].linkedNetwork;

                    if(shapeNetwork?.valueConflict || colorNetwork?.valueConflict) {
                        slotComp.slots[2].value = null;
                        break;
                    }

                    const isShape = shapeNetwork?.currentValue?.getItemType() === "shape";
                    const isColor = colorNetwork?.currentValue?.getItemType() === "color";

                    if(isShape && isColor) {
                        const coloredShape = this.root.shapeDefinitionMgr.shapeActionPaintWith(
                            shapeNetwork.currentValue.definition,
                            colorNetwork.currentValue.color
                        );
                        slotComp.slots[2].value = this.root.shapeDefinitionMgr.getShapeItemFromDefinition(coloredShape);
                    } else if(isShape) {
                        slotComp.slots[2].value = shapeNetwork.currentValue;
                    }
                    
                    break;
                }
            }
        }
    }
}
