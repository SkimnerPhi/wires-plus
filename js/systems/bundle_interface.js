import { globalConfig } from "shapez/core/config";
import { enumColorsToHexCode } from "shapez/game/colors";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { BundleInterfaceComponent } from "../components/bundle_interface";

export class BundleInterfaceSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BundleInterfaceComponent]);

        this.root.signals.entityManuallyPlaced.add(entity => {
            const editorHud = this.root.hud.parts.bundleInterfaceEdit;

            if (editorHud) {
                editorHud.editInterfaceChannel(entity, {deleteOnCancel: true});
            }
        });
    }

    drawChunk(parameters, chunk) {
        const contents = chunk.wireContents;
        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
                const entity = contents[x][y];
                if (!entity?.components.BundleInterface) {
                    continue;
                }

                const channel = entity.components.BundleInterface.channel;
                if (!channel) {
                    continue;
                }

                parameters.context.fillStyle = enumColorsToHexCode[channel];

                const origin = entity.components.StaticMapEntity.origin;
                const xPos = (origin.x + 0.5) * globalConfig.tileSize;
                const yPos = (origin.y + 0.5) * globalConfig.tileSize;
                const dim = 0.2 * globalConfig.tileSize;

                parameters.context.fillRect(xPos - dim / 2, yPos - dim / 2, dim, dim);
            }
        }
    }
}