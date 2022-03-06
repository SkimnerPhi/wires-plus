import { enumColors, enumColorMixingResults } from "shapez/game/colors";
import { enumSubShape, ShapeDefinition } from "shapez/game/shape_definition";

export const enumCombinedShape = {
    circlestar: "circlestar",
    rectcircle: "rectcircle",
    starrect: "starrect",
    circlewindmill: "circlewindmill",
    rectwindmill: "rectwindmill",
    starwindmill: "starwindmill",
};

const s = enumSubShape;
const m = enumCombinedShape;

export const enumShapeCombiningResults = {
    [s.rect]: {
        [s.circle]: m.rectcircle,
        [s.star]: m.starrect,
        [s.windmill]: m.rectwindmill,
    },

    [s.circle]: {
        [s.rect]: m.rectcircle,
        [s.star]: m.circlestar,
        [s.windmill]: m.circlewindmill,
    },

    [s.star]: {
        [s.circle]: m.circlestar,
        [s.rect]: m.starrect,
        [s.windmill]: m.starwindmill,
    },

    [s.windmill]: {
        [s.circle]: m.circlewindmill,
        [s.star]: m.starwindmill,
        [s.rect]: m.rectwindmill,
    },

    // auto
    [enumCombinedShape.circlestar]: {},
    [enumCombinedShape.circlewindmill]: {},
    [enumCombinedShape.rectcircle]: {},
    [enumCombinedShape.rectwindmill]: {},
    [enumCombinedShape.starrect]: {},
    [enumCombinedShape.starwindmill]: {},
};

 export function combineDefinitions(definition1, definition2) {
    let outDefinition = new ShapeDefinition({ layers: [] });

    const maxLayers = Math.max(definition1.layers.length, definition2.layers.length);

    for (let i = 0; i < maxLayers; ++i) {
        //handle one layer at a time
        const shape1 = definition1.layers[i];
        const shape2 = definition2.layers[i];
        let layerResult = [null, null, null, null];

        if (shape1 && shape2) {
            for (let quad = 0; quad < 4; ++quad) {
                let outColor;
                let outShape;

                if (shape1[quad] && shape2[quad]) {
                    const color1 = shape1[quad].color;
                    const color2 = shape2[quad].color;
                    const subShape1 = shape1[quad].subShape;
                    const subShape2 = shape2[quad].subShape;

                    //mix the colors!
                    if (color1 == enumColors.uncolored) {
                        outColor = enumColorMixingResults[color2][color1];
                    } else {
                        outColor = enumColorMixingResults[color1][color2];
                    }

                    outShape = enumShapeCombiningResults[subShape1][subShape2];
                } else if (shape1[quad]) {
                    outShape = shape1[quad].subShape;
                    outColor = shape1[quad].color;
                } else if (shape2[quad]) {
                    outShape = shape2[quad].subShape;
                    outColor = shape2[quad].color;
                }

                if (outColor && outShape) {
                    const shape1linkedBefore = shape1[quad]?.linkedBefore;
                    const shape2linkedBefore = shape2[quad]?.linkedBefore;

                    const shape1linkedAfter = shape1[quad]?.linkedAfter;
                    const shape2linkedAfter = shape2[quad]?.linkedAfter;
                    layerResult[quad] = {
                        linkedBefore: shape1linkedBefore || shape2linkedBefore,
                        linkedAfter: shape1linkedAfter || shape2linkedAfter,
                        subShape: outShape,
                        color: outColor,
                    };
                }
            }
        } else {
            layerResult = shape1 ? shape1 : shape2;
        }

        outDefinition.layers.push(layerResult);
    }

    return outDefinition;
}

export function shapeActionCompress(root, definition) {
    const definitionMgr = root.shapeDefinitionMgr;
    const key = "compress/" + definition.getHash();
    if (definitionMgr.operationCache[key]) {
        return /** @type {ShapeDefinition} */ (definitionMgr.operationCache[key]);
    }

    const newDefinition = definition.getClonedLayers();
    for (let i = 0; i < newDefinition.length; i++) {
        const layer = newDefinition[i];
        for (let quadIndex = 0; quadIndex < 4; ++quadIndex) {
            const quad = layer[quadIndex];
            if (quad) {
                quad.color = enumColors.uncolored;
                const lastItem = layer[(quadIndex + 3) % 4];
                const nextItem = layer[(quadIndex + 1) % 4];

                if (lastItem) {
                    quad.linkedBefore = true;
                }
                if (nextItem) {
                    quad.linkedAfter = true;
                }
            }
        }
    }
    return (
        definitionMgr.operationCache[key] = definitionMgr.registerOrReturnHandle(
            // @ts-ignore Yes, mine is different
            new ShapeDefinition({ layers: newDefinition })
        )
    );
}