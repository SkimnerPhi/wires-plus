import { globalConfig } from "shapez/core/config";
import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { Loader } from "shapez/core/loader";
import { createLogger } from "shapez/core/logging";
import { fastArrayDeleteValueIfContained } from "shapez/core/utils";
import { arrayAllDirections, enumDirectionToVector, enumInvertedDirections, Vector } from "shapez/core/vector";
import { MetaWireBuilding, arrayWireRotationVariantToType } from "shapez/game/buildings/wire";
import { getCodeFromBuildingData } from "shapez/game/building_codes";
import { enumColors } from "shapez/game/colors";
import { WireComponent } from "shapez/game/components/wire";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { WireTunnelComponent } from "shapez/game/components/wire_tunnel";
import { isTruthyItem } from "shapez/game/items/boolean_item";
import { MapChunkView } from "shapez/game/map_chunk_view";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { WireSystem, WireNetwork } from "shapez/game/systems/wire";
import { arrayBundleRotationVariantToType, enumBundleType, MetaBundleBuilding } from "../buildings/bundle";
import { BundleComponent } from "../components/bundle";
import { BundledPinsComponent } from "../components/bundled_pins";
import { bundleConnectionFacing, BundleInterfaceComponent, wireConnectionFacing } from "../components/bundle_interface";
import { isModLoaded } from "../utils";

export function patchWireSystem() {
    const logger = createLogger("wires");

    const bundleSprites = {};
    for (const bundleType in enumBundleType) {
        bundleSprites[bundleType] = Loader.getSprite(`sprites/wires/sets/bundle_${bundleType}.png`);
    }

    this.modInterface.extendClass(WireSystem, ({ $old }) => ({
        recomputeWiresNetwork() {
            this.needsRecompute = false;
            logger.log("Recomputing wires network");

            this.networks = [];

            const wireEntities = this.root.entityMgr.getAllWithComponent(WireComponent);
            const bundleEntities = this.root.entityMgr.getAllWithComponent(BundleComponent);
            const interfaceEntities = this.root.entityMgr.getAllWithComponent(BundleInterfaceComponent);
            const tunnelEntities = this.root.entityMgr.getAllWithComponent(WireTunnelComponent);
            const wiredPinEntities = this.root.entityMgr.getAllWithComponent(WiredPinsComponent);
            const bundledPinEntities = this.root.entityMgr.getAllWithComponent(BundledPinsComponent);

            // Clear all network references, but not on the first update since that's the deserializing one
            if (!this.isFirstRecompute) {
                for (let i = 0; i < wireEntities.length; ++i) {
                    wireEntities[i].components.Wire.linkedNetwork = null;
                }
                for (let i = 0; i < bundleEntities.length; ++i) {
                    bundleEntities[i].components.Bundle.linkedNetworks = {};
                }
                for (let i = 0; i < interfaceEntities.length; ++i) {
                    interfaceEntities[i].components.BundleInterface.linkedNetwork = null;
                }
                for (let i = 0; i < tunnelEntities.length; ++i) {
                    tunnelEntities[i].components.WireTunnel.linkedNetworks = [];
                }

                for (let i = 0; i < wiredPinEntities.length; ++i) {
                    const slots = wiredPinEntities[i].components.WiredPins.slots;
                    for (let k = 0; k < slots.length; ++k) {
                        slots[k].linkedNetwork = null;
                    }
                }

                for (let i = 0; i < bundledPinEntities.length; ++i) {
                    const slots = bundledPinEntities[i].components.BundledPins.slots;
                    for (let k = 0; k < slots.length; ++k) {
                        for (const color in enumColors) {
                            slots[k].channels[color].linkedNetwork = null;
                        }
                    }
                }
            } else {
                logger.log("Recomputing wires first time");
                this.isFirstRecompute = false;
            }

            // Iterate over all ejector slots
            for (let i = 0; i < wiredPinEntities.length; ++i) {
                const entity = wiredPinEntities[i];
                const slots = entity.components.WiredPins.slots;
                for (let k = 0; k < slots.length; ++k) {
                    const slot = slots[k];

                    // Ejectors are computed directly, acceptors are just set
                    if (slot.type === enumPinSlotType.logicalEjector && !slot.linkedNetwork) {
                        this.findNetworkForEjector(entity, slot);
                    }
                }
            }

            for (let i = 0; i < bundledPinEntities.length; ++i) {
                const entity = bundledPinEntities[i];
                const slots = entity.components.BundledPins.slots;
                for (let k = 0; k < slots.length; ++k) {
                    const slot = slots[k];

                    if (slot.type === enumPinSlotType.logicalEjector) {
                        for (const c in slot.channels) {
                            const channel = slot.channels[c];

                            if (!channel.linkedNetwork) {
                                this.findNetworkForEjector(entity, slot, "bundle", c);
                            }
                        }
                    }
                }
            }
        },
        findNetworkForEjector(initialEntity, slot, variantMask = null, variantSubMask = null) {
            let currentNetwork = new WireNetwork();
            const entitiesToVisit = [
                {
                    entity: initialEntity,
                    slot,
                    variantMask,
                    variantSubMask,
                },
            ];

            while (entitiesToVisit.length > 0) {
                const nextData = entitiesToVisit.pop();
                const nextEntity = nextData.entity;
                var variantMask = nextData.variantMask;
                var variantSubMask = nextData.variantSubMask;

                const wireComp = nextEntity.components.Wire;
                const staticComp = nextEntity.components.StaticMapEntity;

                // Where to search for neighbours
                let newSearchDirections = [];
                let newSearchTile = null;

                //// WIRE
                if (wireComp) {
                    // Sanity check
                    assert(
                        !wireComp.linkedNetwork || wireComp.linkedNetwork === currentNetwork,
                        "Mismatching wire network on wire entity " +
                            (wireComp.linkedNetwork ? wireComp.linkedNetwork.uid : "<empty>") +
                            " vs " +
                            currentNetwork.uid +
                            " @ " +
                            staticComp.origin.toString()
                    );

                    if (!wireComp.linkedNetwork) {
                        if (variantMask && wireComp.variant !== variantMask) {
                            // Mismatching variant
                        } else {
                            // This one is new! :D
                            wireComp.linkedNetwork = currentNetwork;
                            currentNetwork.wires.push(nextEntity);

                            newSearchDirections = arrayAllDirections;
                            newSearchTile = staticComp.origin;
                            variantMask = wireComp.variant;
                        }
                    }
                }

                const bundleComp = nextEntity.components.Bundle;
                if (bundleComp && variantMask === "bundle") {
                    if (!bundleComp.linkedNetworks[variantSubMask]) {
                        bundleComp.linkedNetworks[variantSubMask] = currentNetwork;
                        currentNetwork.wires.push(nextEntity);

                        newSearchDirections = arrayAllDirections;
                        newSearchTile = staticComp.origin;
                    }
                }

                const interfaceComp = nextEntity.components.BundleInterface;
                if (interfaceComp && !interfaceComp.linkedNetwork) {
                    interfaceComp.linkedNetwork = currentNetwork;
                    currentNetwork.wires.push(nextEntity);

                    if(variantMask === "bundle") {
                        newSearchDirections = [ staticComp.localDirectionToWorld(wireConnectionFacing) ];
                        variantMask = null;
                        variantSubMask = null;
                    } else {
                        newSearchDirections = [ staticComp.localDirectionToWorld(bundleConnectionFacing) ];
                        variantMask = "bundle";
                        variantSubMask = interfaceComp.channel;
                    }

                    newSearchTile = staticComp.origin;
                }

                //// PINS
                const wiredPinsComp = nextEntity.components.WiredPins;
                if (wiredPinsComp) {
                    const slot = nextData.slot;
                    assert(slot, "No slot set for next entity");

                    // Sanity check
                    assert(
                        !slot.linkedNetwork || slot.linkedNetwork === currentNetwork,
                        "Mismatching wire network on pin slot entity " +
                            (slot.linkedNetwork ? slot.linkedNetwork.uid : "<empty>") +
                            " vs " +
                            currentNetwork.uid
                    );
                    if (!slot.linkedNetwork) {
                        // This one is new

                        // Add to the right list
                        if (slot.type === enumPinSlotType.logicalEjector) {
                            currentNetwork.providers.push({ entity: nextEntity, slot });
                        } else if (slot.type === enumPinSlotType.logicalAcceptor) {
                            currentNetwork.receivers.push({ entity: nextEntity, slot });
                        } else {
                            assertAlways(false, "unknown slot type:" + slot.type);
                        }

                        // Register on the network
                        currentNetwork.allSlots.push({ entity: nextEntity, slot });
                        slot.linkedNetwork = currentNetwork;

                        // Specify where to search next
                        newSearchDirections = [staticComp.localDirectionToWorld(slot.direction)];
                        newSearchTile = staticComp.localTileToWorld(slot.pos);
                    }
                }
                
                const bundledPinsComp = nextEntity.components.BundledPins;
                if (bundledPinsComp) {
                    const slot = nextData.slot;
                    const channel = slot.channels[variantSubMask];
                    if (!channel.linkedNetwork) {
                        if (slot.type === enumPinSlotType.logicalEjector) {
                            currentNetwork.providers.push({ entity: nextEntity, slot: channel });
                        } else if (slot.type === enumPinSlotType.logicalAcceptor) {
                            currentNetwork.receivers.push({ entity: nextEntity, slot: channel });
                        }

                        currentNetwork.allSlots.push({ entity: nextEntity, slot: channel });
                        channel.linkedNetwork = currentNetwork;

                        newSearchDirections = [staticComp.localDirectionToWorld(slot.direction)];
                        newSearchTile = staticComp.localTileToWorld(slot.pos);
                    }
                }

                if (newSearchTile) {
                    // Find new surrounding wire targets
                    const newTargets = this.findSurroundingWireTargets(
                        newSearchTile,
                        newSearchDirections,
                        currentNetwork,
                        variantMask,
                        variantSubMask
                    );

                    for (let i = 0; i < newTargets.length; ++i) {
                        entitiesToVisit.push(newTargets[i]);
                    }
                }
            }

            if (
                currentNetwork.providers.length > 0 &&
                (currentNetwork.wires.length > 0 ||
                    currentNetwork.receivers.length > 0 ||
                    currentNetwork.tunnels.length > 0)
            ) {
                this.networks.push(currentNetwork);
            } else {
                // Unregister network again
                for (let i = 0; i < currentNetwork.wires.length; ++i) {
                    currentNetwork.wires[i].components.Wire.linkedNetwork = null;
                }

                for (let i = 0; i < currentNetwork.tunnels.length; ++i) {
                    fastArrayDeleteValueIfContained(
                        currentNetwork.tunnels[i].components.WireTunnel.linkedNetworks,
                        currentNetwork
                    );
                }

                for (let i = 0; i < currentNetwork.allSlots.length; ++i) {
                    currentNetwork.allSlots[i].slot.linkedNetwork = null;
                }
            }
        },
        findSurroundingWireTargets(initialTile, directions, network, variantMask = null, variantSubMask = null) {
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

                    if (variantMask === "bundle") {
                        const bundleComp = entity.components.Bundle;
                        if (bundleComp && !bundleComp.linkedNetworks[variantSubMask]) {
                            result.push({
                                entity,
                                variantMask,
                                variantSubMask,
                            });
                        }

                        const interfaceComp = entity.components.BundleInterface;
                        
                        if (
                            interfaceComp &&
                            !interfaceComp.linkedNetwork &&
                            interfaceComp.channel === variantSubMask
                        ) {
                            const staticComp = entity.components.StaticMapEntity;
                            const from = staticComp.worldDirectionToLocal(direction);
                            if (from === enumInvertedDirections[bundleConnectionFacing] && !interfaceComp.linkedNetwork) {
                                result.push({
                                    entity,
                                    variantMask,
                                    variantSubMask,
                                });
                            }
                        }

                        const bundledPinComp = entity.components.BundledPins;
                        if (bundledPinComp) {
                            const staticComp = entity.components.StaticMapEntity;

                            // Go over all slots and see if they are connected
                            const pinSlots = bundledPinComp.slots;
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

                                if (!slot.channels[variantSubMask].linkedNetwork) {
                                    result.push({
                                        entity,
                                        slot,
                                        variantMask,
                                        variantSubMask,
                                    });
                                }
                            }
                        }
                    } else {
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
                                variantMask,
                                variantSubMask,
                            });
                        }

                        const interfaceComp = entity.components.BundleInterface;
                        if (interfaceComp && !interfaceComp.linkedNetwork) {
                            const staticComp = entity.components.StaticMapEntity;

                            const from = staticComp.worldDirectionToLocal(direction);
                            if (from === enumInvertedDirections[wireConnectionFacing] && !interfaceComp.linkedNetwork) {
                                result.push({
                                    entity,
                                    variantMask,
                                    variantSubMask,
                                });
                            }
                        }

                        // Check for connected slots
                        const wiredPinComp = entity.components.WiredPins;
                        if (wiredPinComp) {
                            const staticComp = entity.components.StaticMapEntity;

                            // Go over all slots and see if they are connected
                            const pinSlots = wiredPinComp.slots;
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
            }

            return result;
        },
        getSpriteSetAndOpacityForWire(wireComp) {
            if (!wireComp.linkedNetwork) {
                // There is no network, it's empty
                return {
                    spriteSet: this.wireSprites[wireComp.variant],
                    opacity: 0.5,
                };
            }
    
            const network = wireComp.linkedNetwork;
            if (network.valueConflict) {
                // There is a conflict
                return {
                    spriteSet: this.wireSprites[wireComp.variant],
                    opacity: 1,
                };
            }
    
            return {
                spriteSet: this.wireSprites[wireComp.variant],
                opacity: isTruthyItem(network.currentValue) ? 1 : 0.5,
            };
        },
        drawChunk(parameters, chunk) {
            const contents = chunk.wireContents;
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                    const entity = contents[x][y];
                    if (entity) {
                        if (entity.components.Wire) {
                            const wireComp = entity.components.Wire;
                            const wireType = wireComp.type;

                            const { opacity, spriteSet } = this.getSpriteSetAndOpacityForWire(wireComp);

                            const sprite = spriteSet[wireType];

                            assert(sprite, "Unknown wire type: " + wireType);
                            const staticComp = entity.components.StaticMapEntity;
                            parameters.context.globalAlpha = opacity;
                            staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 0);

                            if(wireComp.linkedNetwork?.valueConflict) {
                                const conflictSprite = this.wireSprites.conflict[wireType];
                                parameters.context.globalAlpha = 1;
                                staticComp.drawSpriteOnBoundsClipped(parameters, conflictSprite, 0);
                            }
                        }
                        if (entity.components.Bundle) {
                            const bundleComp = entity.components.Bundle;
                            const bundleType = bundleComp.type;

                            const sprite = bundleSprites[bundleType];
                            const staticComp = entity.components.StaticMapEntity;
                            parameters.context.globalAlpha = 1;
                            staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 0);
                        }
                    }
                }
            }

            parameters.context.globalAlpha = 1;
        },
        isEntityRelevantForWires(entity) {
            return entity.components.Wire
                || entity.components.WiredPins
                || entity.components.WireTunnel
                || entity.components.Bundle
                || entity.components.BundleInterface
                || entity.components.BundledPins;
        },
        updateSurroundingWirePlacement(affectedArea) {
            const metaWire = gMetaBuildingRegistry.findByClass(MetaWireBuilding);
            const metaBundle = (() => {
                // gross hack to keep dev mode from blowing up from assertion errors
                if (isModLoaded("wires-plus-plus")) {
                    return gMetaBuildingRegistry.findByClass(MetaBundleBuilding);
                }
            })();

            for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
                for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
                    const targetEntities = this.root.map.getLayersContentsMultipleXY(x, y);
                    for (let i = 0; i < targetEntities.length; ++i) {
                        const targetEntity = targetEntities[i];
                        const targetStaticComp = targetEntity.components.StaticMapEntity;

                        const targetWireComp = targetEntity.components.Wire;
                        if (targetWireComp) {
                            const variant = targetStaticComp.getVariant();

                            const {
                                rotation,
                                rotationVariant,
                            } = metaWire.computeOptimalDirectionAndRotationVariantAtTile({
                                root: this.root,
                                tile: new Vector(x, y),
                                rotation: targetStaticComp.originalRotation,
                                variant,
                                layer: targetEntity.layer,
                            });
        
                            // Compute delta to see if anything changed
                            const newType = arrayWireRotationVariantToType[rotationVariant];
                            
                            if (targetStaticComp.rotation !== rotation || newType !== targetWireComp.type) {
                                // Change stuff
                                targetStaticComp.rotation = rotation;
                                metaWire.updateVariants(targetEntity, rotationVariant, variant);
        
                                // Update code as well
                                targetStaticComp.code = getCodeFromBuildingData(metaWire, variant, rotationVariant);
        
                                // Make sure the chunks know about the update
                                this.root.signals.entityChanged.dispatch(targetEntity);
                            }
                        }

                        const targetBundleComp = targetEntity.components.Bundle;
                        if (metaBundle && targetBundleComp) {
                            const {
                                rotation,
                                rotationVariant,
                            } = metaBundle.computeOptimalDirectionAndRotationVariantAtTile({
                                root: this.root,
                                tile: new Vector(x, y),
                                rotation: targetStaticComp.rotation,
                                variant: defaultBuildingVariant,
                                layer: targetEntity.layer,
                            });

                            const newType = arrayBundleRotationVariantToType[rotationVariant];

                            if (targetStaticComp.rotation !== rotation || newType !== targetBundleComp.type) {
                                // Change stuff
                                targetStaticComp.rotation = rotation;
                                metaBundle.updateVariants(targetEntity, rotationVariant, defaultBuildingVariant);

                                // Make sure the chunks know about the update
                                this.root.signals.entityChanged.dispatch(targetEntity);
                            }
                        }
                    }
                }
            }
        },
    }));

    this.modInterface.extendClass(MapChunkView, ({ $old }) => ({
        drawWiresForegroundLayer(parameters) {
            const systems = this.root.systemMgr.systems;
            systems.wire.drawChunk(parameters, this);
            systems.staticMapEntities.drawWiresChunk(parameters, this);
            systems.wiredPins.drawChunk(parameters, this);
            systems.bundleInterface.drawChunk(parameters, this);
        }
    }));
}