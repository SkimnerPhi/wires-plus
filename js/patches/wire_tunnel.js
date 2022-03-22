import { generateMatrixRotations } from "shapez/core/utils";
import { Vector } from "shapez/core/vector";
import { MetaWireTunnelBuilding } from "shapez/game/buildings/wire_tunnel";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { enumWireInsulatorVariants, WireInsulatorComponent } from "../components/wire_insulator";
import { isModSafeRewardUnlocked } from "../utils";

const overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
    forward: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    turn: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
    double_turn: generateMatrixRotations([1, 1, 0, 1, 0, 1, 0, 1, 1]),
};

export function patchWireTunnel() {
    this.modInterface.addVariantToExistingBuilding(
        MetaWireTunnelBuilding,
        enumWireInsulatorVariants.forward,
        {
            name: "Wire Insulator",
            description: "Prevents a wire from connecting to adjacent wires.",
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_freeplay);
            }
        }
    );
    this.modInterface.addVariantToExistingBuilding(
        MetaWireTunnelBuilding,
        enumWireInsulatorVariants.turn,
        {
            name: "Wire Insulator",
            description: "Prevents a wire from connecting to adjacent wires.",
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_freeplay);
            }
        }
    );
    this.modInterface.addVariantToExistingBuilding(
        MetaWireTunnelBuilding,
        enumWireInsulatorVariants.double_turn,
        {
            name: "Wire Insulator",
            description: "Prevents two wires from connecting to adjacent wires.",
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_freeplay);
            }
        }
    );
    this.modInterface.addVariantToExistingBuilding(
        MetaWireTunnelBuilding,
        enumWireInsulatorVariants.swap,
        {
            name: "Wire Swapper",
            description: "Switches two parallel wires.",
            dimensions: new Vector(2, 1),
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_freeplay);
            }
        }
    );

    this.modInterface.extendClass(MetaWireTunnelBuilding, ({ $old }) => ({
        getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
            return overlayMatrices[variant]?.[rotation];
        },
        getIsRotateable() {
            return true;
        },
        updateVariants(entity, rotationVariant, variant) {
            const tunnelType = enumWireInsulatorVariants[variant];
            if (!entity.components.WireInsulator) {
                entity.addComponent(new WireInsulatorComponent({ type: tunnelType }));
            }
        },
    }));
}