// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {DefenceTowerType} from "./Config";
import GameActor from "./GameActor";

export  enum GamEventType {

    None,
    CreateTower,
    Hit,
    Die,
}

export default class GameEventBase {
    eventType: GamEventType = GamEventType.None;
}

export class GameEventCreateTower extends GameEventBase {
    eventType: GamEventType = GamEventType.CreateTower;
    towerType: DefenceTowerType;
    pos: cc.Vec2;
}

export class GameEventHit extends GameEventBase {
    eventType: GamEventType = GamEventType.Hit;
    hitter: GameActor;
    beHitter: GameActor;
}

export class GameEventDie extends GameEventBase {
    eventType: GamEventType = GamEventType.Die;
    actor: GameActor;
}
