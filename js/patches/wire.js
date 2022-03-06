import { Loader } from "shapez/core/loader";
import { enumDirection } from "shapez/core/vector";
import { wireVariants, MetaWireBuilding, arrayWireRotationVariantToType } from "shapez/game/buildings/wire";
import { enumWireVariant, enumWireType } from "shapez/game/components/wire";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { isModSafeRewardUnlocked } from "../utils";

export function patchWire() {
    const addToEnum = {
        third: "third",
        fourth: "fourth",
    };
    Object.assign(enumWireVariant, addToEnum);
    Object.assign(wireVariants, addToEnum);

    const enumWireVariantToVariant = {
        [defaultBuildingVariant]: enumWireVariant.first,
        [wireVariants.second]: enumWireVariant.second,
        [wireVariants.third]: enumWireVariant.third,
        [wireVariants.fourth]: enumWireVariant.fourth,
    };

    this.modInterface.addVariantToExistingBuilding(
        MetaWireBuilding,
        enumWireVariant.third,
        {
            name: "Wire",
            description: "Transfers signals, which can be items, colours or booleans (1 or 0). Differently-coloured wires do not connect to each other.",
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_freeplay);
            },
            rotationVariants: [0, 1, 2, 3],
        }
    );
    this.modInterface.addVariantToExistingBuilding(
        MetaWireBuilding,
        enumWireVariant.fourth,
        {
            name: "Wire",
            description: "Transfers signals, which can be items, colours or booleans (1 or 0). Differently-coloured wires do not connect to each other.",
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_freeplay);
            },
            rotationVariants: [0, 1, 2, 3],
        }
    );
    
    this.modInterface.extendClass(MetaWireBuilding, ({ $old }) => ({
        getSilhouetteColor(variant) {
            return {
                [defaultBuildingVariant]: "#61ef6f",
                [wireVariants.second]: "#5fb2f1",
                [wireVariants.third]: "#f0c04f",
                [wireVariants.fourth]: "#a87ce9",
            }[variant];
        },
        updateVariants(entity, rotationVariant, variant) {
            entity.components.Wire.type = arrayWireRotationVariantToType[rotationVariant];
            entity.components.Wire.variant = enumWireVariantToVariant[variant];
        },
        getPreviewSprite(rotationVariant, variant) {
            const wireVariant = enumWireVariantToVariant[variant];
            switch (arrayWireRotationVariantToType[rotationVariant]) {
                case enumWireType.forward: {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_forward.png");
                }
                case enumWireType.turn: {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_turn.png");
                }
                case enumWireType.split: {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_split.png");
                }
                case enumWireType.cross: {
                    return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_cross.png");
                }
                default: {
                    assertAlways(false, "Invalid wire rotation variant");
                }
            }
        },
        computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
            const wireVariant = enumWireVariantToVariant[variant];
            const connections = {
                top: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.top }),
                right: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.right }),
                bottom: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.bottom }),
                left: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.left }),
            };
    
            let flag = 0;
            flag |= connections.top ? 0x1000 : 0;
            flag |= connections.right ? 0x100 : 0;
            flag |= connections.bottom ? 0x10 : 0;
            flag |= connections.left ? 0x1 : 0;
    
            let targetType = enumWireType.forward;
    
            // First, reset rotation
            rotation = 0;
    
            switch (flag) {
                case 0x0000:
                    // Nothing
                    break;
    
                case 0x0001:
                    // Left
                    rotation += 90;
                    break;
    
                case 0x0010:
                    // Bottom
                    // END
                    break;
    
                case 0x0011:
                    // Bottom | Left
                    targetType = enumWireType.turn;
                    rotation += 90;
                    break;
    
                case 0x0100:
                    // Right
                    rotation += 90;
                    break;
    
                case 0x0101:
                    // Right | Left
                    rotation += 90;
                    break;
    
                case 0x0110:
                    // Right | Bottom
                    targetType = enumWireType.turn;
                    break;
    
                case 0x0111:
                    // Right | Bottom | Left
                    targetType = enumWireType.split;
                    break;
    
                case 0x1000:
                    // Top
                    break;
    
                case 0x1001:
                    // Top | Left
                    targetType = enumWireType.turn;
                    rotation += 180;
                    break;
    
                case 0x1010:
                    // Top | Bottom
                    break;
    
                case 0x1011:
                    // Top | Bottom | Left
                    targetType = enumWireType.split;
                    rotation += 90;
                    break;
    
                case 0x1100:
                    // Top | Right
                    targetType = enumWireType.turn;
                    rotation -= 90;
                    break;
    
                case 0x1101:
                    // Top | Right | Left
                    targetType = enumWireType.split;
                    rotation += 180;
                    break;
    
                case 0x1110:
                    // Top | Right | Bottom
                    targetType = enumWireType.split;
                    rotation -= 90;
                    break;
    
                case 0x1111:
                    // Top | Right | Bottom | Left
                    targetType = enumWireType.cross;
                    break;
            }
    
            return {
                // Clamp rotation
                rotation: (rotation + 360 * 10) % 360,
                rotationVariant: arrayWireRotationVariantToType.indexOf(targetType),
            };
        }
    }));
}