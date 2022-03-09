import { generateMatrixRotations } from "shapez/core/utils";
import { enumDirectionToVector, Vector, enumInvertedDirections, enumDirection } from "shapez/core/vector";
import { MetaWireTunnelBuilding } from "shapez/game/buildings/wire_tunnel";
import { Component } from "shapez/game/component";
import { WireTunnelComponent } from "shapez/game/components/wire_tunnel";
import { GameLogic } from "shapez/game/logic";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { WireSystem } from "shapez/game/systems/wire";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { enumWireInsulatorVariants, WireInsulatorComponent } from "../components/wire_insulator";
import { isModSafeRewardUnlocked } from "../utils";

export function patchWireTunnel() {
    const overlayMatrices = {
        [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
        forward: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
        turn: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
        double_turn: generateMatrixRotations([1, 1, 0, 1, 0, 1, 0, 1, 1]),
    };

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
    }));

    this.modInterface.extendClass(MetaWireTunnelBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            const tunnelType = enumWireInsulatorVariants[variant];
            if (!entity.components.WireInsulator) {
                entity.addComponent(new WireInsulatorComponent({ type: tunnelType }));
            }
        }
    }));

    this.modInterface.extendClass(WireSystem, ({ $old }) => ({
        findSurroundingWireTargets(initialTile, directions, network, variantMask = null) {
            let result = [];

            // Go over all directions we should search for
            for (let i = 0; i < directions.length; ++i) {
                const offset = enumDirectionToVector[directions[i]];
                const initialSearchTile = initialTile.add(offset);
    
                // Store which tunnels we already visited to avoid infinite loops
                const visitedTunnels = new Set();
    
                // First, find the initial connected entities
                const initialContents = this.root.map.getLayersContentsMultipleXY(
                    initialSearchTile.x,
                    initialSearchTile.y
                );
    
                // Link the initial tile to the initial entities, since it may change
                const contents = [];
                for (let j = 0; j < initialContents.length; ++j) {
                    contents.push({
                        direction: directions[i],
                        entity: initialContents[j],
                        tile: initialSearchTile,
                    });
                }
    
                for (let k = 0; k < contents.length; ++k) {
                    const { direction, entity, tile } = contents[k];
                    const wireComp = entity.components.Wire;
    
                    // Check for wire
                    if (
                        wireComp &&
                        !wireComp.linkedNetwork &&
                        (!variantMask || wireComp.variant === variantMask)
                    ) {
                        // Wires accept connections from everywhere
                        result.push({
                            entity,
                        });
                    }
    
                    // Check for connected slots
                    const pinComp = entity.components.WiredPins;
                    if (pinComp) {
                        const staticComp = entity.components.StaticMapEntity;
    
                        // Go over all slots and see if they are connected
                        const pinSlots = pinComp.slots;
                        for (let j = 0; j < pinSlots.length; ++j) {
                            const slot = pinSlots[j];
    
                            // Check if the position matches
                            const pinPos = staticComp.localTileToWorld(slot.pos);
                            if (!pinPos.equals(tile)) {
                                continue;
                            }
    
                            // Check if the direction (inverted) matches
                            const pinDirection = staticComp.localDirectionToWorld(slot.direction);
                            if (pinDirection !== enumInvertedDirections[direction]) {
                                continue;
                            }
    
                            if (!slot.linkedNetwork) {
                                result.push({
                                    entity,
                                    slot,
                                });
                            }
                        }
                    }
    
                    // Check if it's an insulator, if so, go to the forwarded item
                    const insulatorComp = entity.components.WireInsulator;
                    if (insulatorComp) {
                        if (visitedTunnels.has(entity.uid)) {
                            continue;
                        }
    
                        const staticComp = entity.components.StaticMapEntity;
                        
                        const connections = insulatorComp.connections;
                        for (let j = 0; j < connections.length; ++j) {
                            const conn = connections[j].from;

                            const connPos = staticComp.localTileToWorld(conn.pos);
                            if (!connPos.equals(tile)) {
                                continue;
                            }

                            const connDirection = staticComp.localDirectionToWorld(conn.direction);
                            if (connDirection !== enumInvertedDirections[direction]) {
                                continue;
                            }

                            const toConn = connections[j].to;

                            const tunnelOffset = enumDirectionToVector[toConn.direction];
                            const localForwardedTile = toConn.pos.add(tunnelOffset);
                            const forwardedTile = staticComp.localTileToWorld(localForwardedTile);

                            const connectedContents = this.root.map.getLayersContentsMultipleXY(
                                forwardedTile.x,
                                forwardedTile.y
                            );

                            // Attach the entities and the tile we search at, because it may change
                            for (let h = 0; h < connectedContents.length; ++h) {
                                contents.push({
                                    direction: staticComp.localDirectionToWorld(toConn.direction),
                                    entity: connectedContents[h],
                                    tile: forwardedTile,
                                });
                            }

                            // Add the tunnel to the network
                            const tunnelComp = entity.components.WireTunnel;
                            if (tunnelComp.linkedNetworks.indexOf(network) < 0) {
                                tunnelComp.linkedNetworks.push(network);
                            }
                            if (network.tunnels.indexOf(entity) < 0) {
                                network.tunnels.push(entity);
                            }
        
                            // Remember this tunnel
                            visitedTunnels.add(entity.uid);
                        }
                    }
                }
            }
    
            return result;
        }
    }));

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
        }
    }));
}