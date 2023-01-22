import { globalConfig } from "shapez/core/config";
import { createLogger } from "shapez/core/logging";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { WireSystem } from "shapez/game/systems/wire";

export function patchWireSystem() {
    const logger = createLogger("wires");

    this.modInterface.extendClass(WireSystem, ({ $old }) => ({
        getSpriteSetAndOpacityForWire(wireComp) {
            if (!wireComp.linkedNetwork) {
                // There is no network, it's empty
                return {
                    spriteSet: this.wireSprites[wireComp.variant],
                    opacity: 0.5,
                };
            }
    
            const network = wireComp.linkedNetwork;
            if (network.valueConflict) {
                // There is a conflict
                return {
                    spriteSet: this.wireSprites[wireComp.variant],
                    opacity: 1,
                };
            }
    
            return {
                spriteSet: this.wireSprites[wireComp.variant],
                opacity: isTruthyItem(network.currentValue) ? 1 : 0.5,
            };
        },
        drawChunk(parameters, chunk) {
            const contents = chunk.wireContents;
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                    const entity = contents[x][y];
                    if (entity) {
                        if (entity.components.Wire) {
                            const wireComp = entity.components.Wire;
                            const wireType = wireComp.type;

                            const { opacity, spriteSet } = this.getSpriteSetAndOpacityForWire(wireComp);

                            const sprite = spriteSet[wireType];

                            assert(sprite, "Unknown wire type: " + wireType);
                            const staticComp = entity.components.StaticMapEntity;
                            parameters.context.globalAlpha = opacity;
                            staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 0);

                            if(wireComp.linkedNetwork?.valueConflict) {
                                const conflictSprite = this.wireSprites.conflict[wireType];
                                parameters.context.globalAlpha = 1;
                                staticComp.drawSpriteOnBoundsClipped(parameters, conflictSprite, 0);
                            }
                        }
                        if (entity.components.Bundle) {
                            const bundleComp = entity.components.Bundle;
                            const bundleType = bundleComp.type;

                            const sprite = bundleSprites[bundleType];
                            const staticComp = entity.components.StaticMapEntity;
                            parameters.context.globalAlpha = 1;
                            staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 0);
                        }
                    }
                }
            }

            parameters.context.globalAlpha = 1;
        },
    }));
}