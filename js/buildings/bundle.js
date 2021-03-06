import { Loader } from "shapez/core/loader";
import { generateMatrixRotations } from "shapez/core/utils";
import { enumDirection, Vector } from "shapez/core/vector";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { ModMetaBuilding } from "shapez/mods/mod_meta_building";
import { SOUNDS } from "shapez/platform/sound";
import { BundleComponent } from "../components/bundle";
import { BundleInterfaceComponent } from "../components/bundle_interface";
import { isModSafeRewardUnlocked } from "../utils";

const enumBundleVariants = {
    "interface": "interface",
};

const interfaceOverlayMatrices = generateMatrixRotations([1, 0, 1, 0, 1, 0, 0, 1, 0]);

export const enumBundleType = {
    "node": "node",
    "stub": "stub",
    "forward": "forward",
    "turn": "turn",
    "split": "split",
    "cross": "cross",
}
export const arrayBundleRotationVariantToType = [
    enumBundleType.node,
    enumBundleType.stub,
    enumBundleType.forward,
    enumBundleType.turn,
    enumBundleType.split,
    enumBundleType.cross,
];
export const bundleOverlayMatrices = {
    [enumBundleType.node]: generateMatrixRotations([0, 0, 0, 0, 1, 0, 0, 0, 0]),
    [enumBundleType.stub]: generateMatrixRotations([0, 0, 0, 0, 1, 0, 0, 1, 0]),
    [enumBundleType.forward]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    [enumBundleType.split]: generateMatrixRotations([0, 0, 0, 1, 1, 1, 0, 1, 0]),
    [enumBundleType.turn]: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
    [enumBundleType.cross]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
};

export class MetaBundleBuilding extends ModMetaBuilding {
    constructor() {
        super("bundle");
    }
    static getAllVariantCombinations() {
        const variant = defaultBuildingVariant;
        const name = "Bundle";
        const description = "Transfers multiple signals simultaneously.";
        return [
            {
                variant,
                name,
                description,
                rotationVariant: 0,
            },
            {
                variant,
                name,
                description,
                rotationVariant: 1,
            },
            {
                variant,
                name,
                description,
                rotationVariant: 2,
            },
            {
                variant,
                name,
                description,
                rotationVariant: 3,
            },
            {
                variant,
                name,
                description,
                rotationVariant: 4,
            },
            {
                variant,
                name,
                description,
                rotationVariant: 5,
            },
            {
                variant: enumBundleVariants.interface,
                name: "Bundle Interface",
                description: "Connects wires to the specified channel of a bundle."
            }
        ];
    }
    getHasDirectionLockAvailable(variant) {
        return variant === defaultBuildingVariant;
    }
    getSilhouetteColor() {
        return "#FFFF00";
    }
    getAvailableVariants() {
        return [defaultBuildingVariant, enumBundleVariants.interface];
    }
    getDimensions() {
        return new Vector(1, 1);
    }
    getStayInPlacementMode() {
        return true;
    }
    getPlacementSound() {
        return SOUNDS.placeBelt;
    }
    getRotateAutomaticallyWhilePlacing(variant) {
        return variant === defaultBuildingVariant;
    }
    getLayer() {
        return "wires";
    }
    getSprite(rotationVariant, variant) {
        if (variant !== defaultBuildingVariant) {
            return super.getSprite(rotationVariant, variant);
        }
        return null;
    }
    getIsReplaceable(variant, rotationVariant) {
        return variant === defaultBuildingVariant;
    }
    getIsUnlocked(root) {
        return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_wires_painter_and_levers);
    }
    setupEntityComponents(entity) {
        // do nothing
    }
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                if(entity.components.BundleInterface) {
                    entity.removeComponent(BundleInterfaceComponent);
                }
                if(!entity.components.Bundle) {
                    entity.addComponent(new BundleComponent({}));
                }
                entity.components.Bundle.type = arrayBundleRotationVariantToType[rotationVariant];
                break;
            }
            case enumBundleVariants.interface: {
                if(entity.components.Bundle) {
                    entity.removeComponent(BundleComponent);
                }
                if(!entity.components.BundleInterface) {
                    entity.addComponent(new BundleInterfaceComponent({}));
                }
                break;
            }
        }
    }
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        switch (variant) {
            case defaultBuildingVariant:
                return bundleOverlayMatrices[entity.components.Bundle.type][rotation];
            case enumBundleVariants.interface:
                return interfaceOverlayMatrices[rotation];
        }
    }
    getPreviewSprite(rotationVariant, variant) {
        if (variant !== defaultBuildingVariant) {
            return super.getPreviewSprite(rotationVariant, variant);
        }

        return Loader.getSprite(`sprites/wires/sets/bundle_${arrayBundleRotationVariantToType[rotationVariant]}.png`);
    }
    getBlueprintSprite(rotationVariant, variant) {
        return this.getPreviewSprite(rotationVariant, variant);
    }
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
        if (variant !== defaultBuildingVariant) {
            return super.computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer });
        }

        const connections = {
            top: root.logic.computeBundleEdgeStatus({ tile, edge: enumDirection.top }),
            right: root.logic.computeBundleEdgeStatus({ tile, edge: enumDirection.right }),
            bottom: root.logic.computeBundleEdgeStatus({ tile, edge: enumDirection.bottom }),
            left: root.logic.computeBundleEdgeStatus({ tile, edge: enumDirection.left }),
        };

        let flag = 0;
        flag |= connections.top ? 0x1000 : 0;
        flag |= connections.right ? 0x100 : 0;
        flag |= connections.bottom ? 0x10 : 0;
        flag |= connections.left ? 0x1 : 0;
        let targetType = enumBundleType.node;

        rotation = 0;

        switch (flag) {
            case 0x0000:
                // Nothing
                break;

            case 0x0001:
                // Left
                targetType = enumBundleType.stub;
                rotation += 90;
                break;

            case 0x0010:
                // Bottom
                targetType = enumBundleType.stub;
                break;

            case 0x0011:
                // Bottom | Left
                targetType = enumBundleType.turn;
                rotation += 90;
                break;

            case 0x0100:
                // Right
                targetType = enumBundleType.stub;
                rotation -= 90;
                break;

            case 0x0101:
                // Right | Left
                targetType = enumBundleType.forward;
                rotation += 90;
                break;

            case 0x0110:
                // Right | Bottom
                targetType = enumBundleType.turn;
                break;

            case 0x0111:
                // Right | Bottom | Left
                targetType = enumBundleType.split;
                break;

            case 0x1000:
                // Top
                targetType = enumBundleType.stub;
                rotation += 180;
                break;

            case 0x1001:
                // Top | Left
                targetType = enumBundleType.turn;
                rotation += 180;
                break;

            case 0x1010:
                targetType = enumBundleType.forward;
                break;

            case 0x1011:
                // Top | Bottom | Left
                targetType = enumBundleType.split;
                rotation += 90;
                break;

            case 0x1100:
                // Top | Right
                targetType = enumBundleType.turn;
                rotation -= 90;
                break;

            case 0x1101:
                // Top | Right | Left
                targetType = enumBundleType.split;
                rotation += 180;
                break;

            case 0x1110:
                // Top | Right | Bottom
                targetType = enumBundleType.split;
                rotation -= 90;
                break;

            case 0x1111:
                // Top | Right | Bottom | Left
                targetType = enumBundleType.cross;
                break;
        }

        return {
            // Clamp rotation
            rotation: (rotation + 360 * 10) % 360,
            rotationVariant: arrayBundleRotationVariantToType.indexOf(targetType),
        };
    }
}
