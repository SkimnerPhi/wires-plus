import { enumDirection, Vector } from "shapez/core/vector";
import { Component } from "shapez/game/component";
import { defaultBuildingVariant } from "shapez/game/meta_building";

export const enumWireInsulatorVariants = {
    [defaultBuildingVariant]: defaultBuildingVariant,
    forward: "forward",
    turn: "turn",
    double_turn: "double_turn",
};

export class WireInsulatorComponent extends Component {
    static getId() {
        return "WireInsulator";
    }
    constructor(payload = { type: "forward" }) {
        super();
        
        this.linkedNetworks = [];

        switch(payload.type) {
            case defaultBuildingVariant: {
                this.connections = [
                    [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                        },
                    ],
                    [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.left,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.right,
                        },
                    ],
                ];
                break;
            }
            case enumWireInsulatorVariants.forward: {
                this.connections = [
                    [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                        },
                    ],
                ];
                break;
            }
            case enumWireInsulatorVariants.turn: {
                this.connections = [
                    [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.right,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                        },
                    ],
                ];
                break;
            }
            case enumWireInsulatorVariants.double_turn: {
                this.connections = [
                    [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.left,
                        },
                    ],
                    [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.right,
                        },
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                        },
                    ],
                ];
                break;
            }
            default: {
                this.connections = payload.connections;
                break;
            }
        }
        // Generate reverse lookups
        this.connections = this.connections.flatMap(c => [
            {
                from: c[0],
                to: c[1]
            },
            {
                from: c[1],
                to: c[0]
            },
        ]);
    }
}