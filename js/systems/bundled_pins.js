import { STOP_PROPAGATION } from "shapez/core/signal";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { BundledPinsComponent } from "../components/bundled_pins";

export class BundledPinsSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BundledPinsComponent]);

        this.root.signals.prePlacementCheck.add(this.prePlacementCheck, this);
        this.root.signals.freeEntityAreaBeforeBuild.add(this.freeEntityAreaBeforeBuild, this);
    }

    prePlacementCheck(entity, offset) {
        // Compute area of the building
        const rect = entity.components.StaticMapEntity.getTileSpaceBounds();
        if (offset) {
            rect.x += offset.x;
            rect.y += offset.y;
        }

        // If this entity is placed on the wires layer, make sure we don't
        // place it above a pin
        if (entity.layer === "wires") {
            for (let x = rect.x; x < rect.x + rect.w; ++x) {
                for (let y = rect.y; y < rect.y + rect.h; ++y) {
                    // Find which entities are in same tiles of both layers
                    const entities = this.root.map.getLayersContentsMultipleXY(x, y);
                    for (let i = 0; i < entities.length; ++i) {
                        const otherEntity = entities[i];

                        // Check if entity has a wired component
                        const pinComponent = otherEntity.components.BundledPins;
                        const staticComp = otherEntity.components.StaticMapEntity;
                        if (!pinComponent) {
                            continue;
                        }

                        if (
                            staticComp
                                .getMetaBuilding()
                                .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant())
                        ) {
                            // Don't mind here, even if there would be a collision we
                            // could replace it
                            continue;
                        }

                        // Go over all pins and check if they are blocking
                        const pins = pinComponent.slots;
                        for (let pinSlot = 0; pinSlot < pins.length; ++pinSlot) {
                            const pos = staticComp.localTileToWorld(pins[pinSlot].pos);
                            // Occupied by a pin
                            if (pos.x === x && pos.y === y) {
                                return STOP_PROPAGATION;
                            }
                        }
                    }
                }
            }
        }

        // Check for collisions on the wires layer
        if (this.checkEntityPinsCollide(entity, offset)) {
            return STOP_PROPAGATION;
        }
    }

    checkEntityPinsCollide(entity, offset) {
        const pinsComp = entity.components.BundledPins;
        if (!pinsComp) {
            return false;
        }

        // Go over all slots
        for (let slotIndex = 0; slotIndex < pinsComp.slots.length; ++slotIndex) {
            const slot = pinsComp.slots[slotIndex];

            // Figure out which tile this slot is on
            const worldPos = entity.components.StaticMapEntity.localTileToWorld(slot.pos);
            if (offset) {
                worldPos.x += offset.x;
                worldPos.y += offset.y;
            }

            // Check if there is any entity on that tile (Wired pins are always on the wires layer)
            const collidingEntity = this.root.map.getLayerContentXY(worldPos.x, worldPos.y, "wires");

            // If there's an entity, and it can't get removed -> That's a collision
            if (collidingEntity) {
                const staticComp = collidingEntity.components.StaticMapEntity;
                if (
                    !staticComp
                        .getMetaBuilding()
                        .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant())
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    freeEntityAreaBeforeBuild(entity) {
        const pinsComp = entity.components.BundledPins;
        if (!pinsComp) {
            // Entity has no pins
            return;
        }

        // Remove any stuff which collides with the pins
        for (let i = 0; i < pinsComp.slots.length; ++i) {
            const slot = pinsComp.slots[i];
            const worldPos = entity.components.StaticMapEntity.localTileToWorld(slot.pos);
            const collidingEntity = this.root.map.getLayerContentXY(worldPos.x, worldPos.y, "wires");
            if (collidingEntity) {
                const staticComp = collidingEntity.components.StaticMapEntity;
                assertAlways(
                    staticComp
                        .getMetaBuilding()
                        .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant()),
                    "Tried to replace non-repleaceable entity for pins"
                );
                if (!this.root.logic.tryDeleteBuilding(collidingEntity)) {
                    assertAlways(false, "Tried to replace non-repleaceable entity for pins #2");
                }
            }
        }
    }
}