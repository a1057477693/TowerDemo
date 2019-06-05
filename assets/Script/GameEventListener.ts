// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import GameEventCommponent from "./GameEventCommponent";

const {ccclass, property, requireComponent} = cc._decorator;

@ccclass
@requireComponent(GameEventCommponent)
export default class GameEventListener extends cc.Component {

    eventComponent: GameEventCommponent = null;

    onLoad() {
        this.eventComponent = this.getComponent("GameEventCommponent") as GameEventCommponent;
    }
}
