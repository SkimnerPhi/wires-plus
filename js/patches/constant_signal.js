import { generateMatrixRotations } from "shapez/core/utils";
import { MetaConstantSignalBuilding } from "shapez/game/buildings/constant_signal";
import { ConstantSignalComponent } from "shapez/game/components/constant_signal";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { RandomSignalComponent } from "../components/random_signal";
import { isModSafeRewardUnlocked } from "../utils";

const enumConstantSignalVariants = {
    [defaultBuildingVariant]: defaultBuildingVariant,
    "rng": "rng",
};

const overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
    [enumConstantSignalVariants.rng]: generateMatrixRotations([0, 1, 0, 1, 0, 1, 1, 1, 1]),
}

export function patchConstantSignal() {
    this.modInterface.addVariantToExistingBuilding(
        MetaConstantSignalBuilding,
        enumConstantSignalVariants.rng,
        {
            name: "Random Signal",
            description: "Generates a random boolean value every tick.",
            isUnlocked(root) {
                return isModSafeRewardUnlocked(root, enumHubGoalRewards.reward_constant_signal);
            }
        }
    );

    this.modInterface.extendClass(MetaConstantSignalBuilding, ({ $old }) => ({
        getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
            return overlayMatrices[variant]?.[rotation];
        },
        updateVariants(entity, rotationVariant, variant) {
            const constType = enumConstantSignalVariants[variant];
            switch (constType) {
                case defaultBuildingVariant: {
                    if (entity.components.RandomSignal) {
                        entity.removeComponent(RandomSignalComponent);
                    }
                    if (!entity.components.ConstantSignal) {
                        entity.addComponent(new ConstantSignalComponent({}));
                    }
                    break;
                }
                case enumConstantSignalVariants.rng: {
                    if (entity.components.ConstantSignal) {
                        entity.removeComponent(ConstantSignalComponent);
                    }
                    if (!entity.components.RandomSignal) {
                        entity.addComponent(new RandomSignalComponent());
                    }
                    break;
                }
            }
        },
    }));
}