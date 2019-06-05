// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {default as GameEventBase, GamEventType} from "./GameEventDefine";
import GameActor from "./GameActor";
import GameEventDispatcher from "./GameEventDispatcher";
import GameListener from "./GameListener";
import GameEventListener from "./GameEventListener";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameEventCommponent extends cc.Component {

    //注册的事件集合
    private events: Map<GamEventType, (event: GameEventBase) => boolean> = new Map<GamEventType, (event: GameEventBase) => boolean>();
    //目标
    targer: GameEventListener = null;

    onLoad() {
        this.targer = this.getComponent("GameEventListener") as GameEventListener;
        //为当前目标注册事件分发器
        GameEventDispatcher.getInstance().registComponent(this);
    }

    onDestroy(){
        //节点销毁的时候要清除监听
        GameEventDispatcher.getInstance().removeComponent(this);
    }


    /**
     * 注册事件
     * @param {GamEventType} eventType
     * @param {(event: GameEventBase) => boolean} callBack
     */
    registEvent(eventType: GamEventType, callBack: ((event: GameEventBase) => boolean)): void {
        this.events.set(eventType, callBack);
    }

    /**
     * 响应注册事件 （这里返回布尔类型是为了运行效率 ）
     * @param {GameEventBase} event
     * @returns {boolean}
     */
    onReceiveEvent(event: GameEventBase): boolean {
        if (this.events.has(event.eventType)) {

            return this.events.get(event.eventType).call(this.targer, event);
        }
        return false;
    }


}
