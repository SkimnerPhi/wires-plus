import { enumDirectionToVector, enumInvertedDirections } from "shapez/core/vector";
import { GameLogic } from "shapez/game/logic";

export function patchGameLogic() {
    this.modInterface.extendClass(GameLogic, ({ $old }) => ({
        computeWireEdgeStatus({ wireVariant, tile, edge }) {
            const offset = enumDirectionToVector[edge];
            const targetTile = tile.add(offset);

            // Search for relevant pins
            const pinEntities = this.root.map.getLayersContentsMultipleXY(targetTile.x, targetTile.y);

            // Go over all entities which could have a pin
            for (let i = 0; i < pinEntities.length; ++i) {
                const pinEntity = pinEntities[i];
                const pinComp = pinEntity.components.WiredPins;
                const staticComp = pinEntity.components.StaticMapEntity;

                // Skip those who don't have pins
                if (!pinComp) {
                    continue;
                }

                // Go over all pins
                const pins = pinComp.slots;
                for (let k = 0; k < pinComp.slots.length; ++k) {
                    const pinSlot = pins[k];
                    const pinLocation = staticComp.localTileToWorld(pinSlot.pos);
                    const pinDirection = staticComp.localDirectionToWorld(pinSlot.direction);

                    // Check if the pin has the right location
                    if (!pinLocation.equals(targetTile)) {
                        continue;
                    }

                    // Check if the pin has the right direction
                    if (pinDirection !== enumInvertedDirections[edge]) {
                        continue;
                    }

                    // Found a pin!
                    return true;
                }
            }

            // Now check if there's a connectable entity on the wires layer
            const targetEntity = this.root.map.getTileContent(targetTile, "wires");
            if (!targetEntity) {
                return false;
            }

            // Check if its a crossing
            const insulatorComp = targetEntity.components.WireInsulator;
            if (insulatorComp) {
                const staticComp = targetEntity.components.StaticMapEntity;
                const direction = staticComp.worldDirectionToLocal(edge);
                const connection = insulatorComp.connections.find(c => (
                    direction === enumInvertedDirections[c.from.direction] &&
                    targetTile.equals(staticComp.localTileToWorld(c.from.pos))
                ));
                return !!connection;
            }

            // Check if its a wire
            const wiresComp = targetEntity.components.Wire;
            if (!wiresComp) {
                return false;
            }

            // It's connected if its the same variant
            return wiresComp.variant === wireVariant;
        },
    }));
}