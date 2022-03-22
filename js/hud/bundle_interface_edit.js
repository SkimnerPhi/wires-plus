import { DialogWithForm } from "shapez/core/modal_dialog_elements";
import { FormElementInput, FormElementItemChooser } from "shapez/core/modal_dialog_forms";
import { STOP_PROPAGATION } from "shapez/core/signal";
import { enumMouseButton } from "shapez/game/camera";
import { enumColors } from "shapez/game/colors";
import { BaseHUDPart } from "shapez/game/hud/base_hud_part";
import { COLOR_ITEM_SINGLETONS } from "shapez/game/items/color_item";

export class HUDBundleInterfaceEdit extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    downPreHandler(pos, button) {
        if(this.root.currentLayer !== "wires") {
            return;
        }

        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");

        if (contents) {
            const interfaceComp = contents.components.BundleInterface;
            if (interfaceComp) {
                if (button === enumMouseButton.left) {
                    this.editInterfaceChannel(contents, {
                        deleteOnCancel: false
                    });
                    return STOP_PROPAGATION;
                }
            }
        }
    }

    editInterfaceChannel(entity, {deleteOnCancel = true}) {
        const interfaceComp = entity.components.BundleInterface;
        if (!interfaceComp) {
            return;
        }

        const uid = entity.uid;

        const textInput = new FormElementInput({
            id: "interfaceChannel",
            placeholder: "",
            defaultValue: interfaceComp.channel ?? "",
            validator: val => val in enumColors
        });
        
        const {
            uncolored,
            red,
            yellow,
            green,
            cyan,
            blue,
            purple,
            white,
            ...other
        } = COLOR_ITEM_SINGLETONS;
        const items = [...Object.values(other)];

        const primaryInput = new FormElementItemChooser({
            id: "interfaceItem",
            label: null,
            items: [
                uncolored,
                red,
                yellow,
                green,
                cyan,
                blue,
                purple,
                white,
            ],
        });

        var secondaryInput;
        if (items.length) {
            secondaryInput = new FormElementItemChooser({
                id: "interfaceItemAlt",
                label: null,
                items,
            });
        }
        
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: "Bundle Interface Channel",
            desc: "A colored channel to link to on the bundle network",
            formElements: secondaryInput
                ? [primaryInput, secondaryInput, textInput]
                : [primaryInput, textInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
            closeButton: false,
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        const closeHandler = () => {
            if (!this.root?.entityMgr) {
                return;
            }
            
            const entityRef = this.root.entityMgr.findByUid(uid, false);
            if (!entityRef) {
                return;
            }

            const interfaceComp = entityRef.components.BundleInterface;
            if (!interfaceComp) {
                return;
            }

            if (primaryInput.chosenItem) {
                interfaceComp.channel = primaryInput.chosenItem.getAsCopyableKey();
            } else if (secondaryInput.chosenItem) {
                interfaceComp.channel = secondaryInput.chosenItem.getAsCopyableKey();
            } else {
                interfaceComp.channel = enumColors[textInput.getValue()];
            }

            this.root.systemMgr.systems.wire.needsRecompute = true;
        }

        dialog.buttonSignals.ok.add(closeHandler);
        dialog.valueChosen.add(() => {
            dialog.closeRequested.dispatch();
            closeHandler();
        })

        if (deleteOnCancel) {
            dialog.buttonSignals.cancel.add(() => {
                if (!this.root?.entityMgr) {
                    return;
                }
                
                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    return;
                }
    
                const interfaceComp = entityRef.components.BundleInterface;
                if (!interfaceComp) {
                    return;
                }

                this.root.logic.tryDeleteBuilding(entityRef);
            });
        }
    }
}