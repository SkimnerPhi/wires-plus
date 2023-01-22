import { enumDirectionToVector, enumInvertedDirections } from "shapez/core/vector";
import { enumWireVariant } from "shapez/game/components/wire";
import { WireInsulatorComponent } from "../components/wire_insulator";

export class WireInsulatorElement extends shapez.NetworkElement {
    constructor() {
        super(WireInsulatorComponent);
    }

    clearNetworks(comp) {
        comp.linkedNetworks = [];
    }
    getWireTarget(root, entity, metadata, {
        direction,
        tile,
        network,
        contents,
        visitedTunnels
    }) {
        const insulatorComp = entity.components.WireInsulator;
        const staticComp = entity.components.StaticMapEntity;
        
        const connPos = staticComp.worldToLocalTile(tile);
        const connDir = enumInvertedDirections[staticComp.worldDirectionToLocal(direction)];

        const connection = insulatorComp.connections.find(x => x.from.pos.equals(connPos) && x.from.direction === connDir);

        if (!connection) {
            return null;
        }

        if (visitedTunnels.has({
            entity: entity.uid,
            pair: connection.pair,
        })) {
            return null;
        }

        const tunnelOffset = enumDirectionToVector[connection.to.direction];
        const localForwardedTile = connection.to.pos.add(tunnelOffset);
        const forwardedTile = staticComp.localTileToWorld(localForwardedTile);

        const connectedContents = root.map.getLayersContentsMultipleXY(
            forwardedTile.x,
            forwardedTile.y
        );

        for (const content of connectedContents) {
            contents.push({
                direction: staticComp.localDirectionToWorld(connection.to.direction),
                entity: content,
                tile: forwardedTile,
            });
        }

        if (!insulatorComp.linkedNetworks.includes(network)) {
            insulatorComp.linkedNetworks.push(network);
        }
        if (!network.tunnels.includes(entity)) {
            network.tunnels.push(entity);
        }

        visitedTunnels.add({
            entity: entity.uid,
            pair: connection.pair,
        });
        
        return null;
    }
    computeWireEdgeStatus({ wireVariant, tile, edge }, entity) {
        if (!enumWireVariant[wireVariant]) {
            return false;
        }

        const insulatorComp = entity.components.WireInsulator;
        const staticComp = entity.components.StaticMapEntity;

        for (const connection of insulatorComp.connections) {
            const connLocation = staticComp.localTileToWorld(connection.from.pos);
            const connDirection = staticComp.localDirectionToWorld(connection.from.direction);

            if (!connLocation.equals(tile)) {
                continue;
            }
            if (connDirection !== edge) {
                continue;
            }

            return true;
        }

        return false;
    }
}