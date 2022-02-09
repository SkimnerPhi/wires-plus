import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON } from "shapez/game/items/boolean_item";

export function castBool(value) {
    return value ? BOOL_TRUE_SINGLETON : BOOL_FALSE_SINGLETON;
}
