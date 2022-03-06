import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON } from "shapez/game/items/boolean_item";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { MODS } from "shapez/mods/modloader";

export function castBool(value) {
    return value ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
}

export function isModLoaded(id) {
    return MODS.mods.some(m => m.metadata.id === id);
}

export function isModSafeRewardUnlocked(root, reward) {
    if (isModLoaded("shapez-industries")) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers);
    } else {
        return root.hubGoals.isRewardUnlocked(reward);
    }
}