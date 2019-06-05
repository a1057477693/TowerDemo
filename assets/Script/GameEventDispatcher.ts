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
import GameEventBase from "./GameEventDefine";

/**
 * 事件分发器
 */
export default class GameEventDispatcher {

    private static _instance: GameEventDispatcher = null;

    static getInstance(): GameEventDispatcher {
        if (GameEventDispatcher._instance == null) {
            GameEventDispatcher._instance = new GameEventDispatcher();
        }
        return GameEventDispatcher._instance;
    }

    //所有注册了事件分发器的目标
    allComponents: GameEventCommponent[] = [];

    /**
     * 注册事件分发器
     * @param {GameEventCommponent} component
     */
    registComponent(component: GameEventCommponent) {
        this.allComponents.push(component);
    }

    /**
     * 为目标删除事件分发器
     * @param {GameEventCommponent} component
     */
    removeComponent(component: GameEventCommponent) {

        console.log("GameEventDispatcher removeComponent name:",component.name);
        let idx = this.allComponents.indexOf(component);
        if (idx != -1) {
            this.allComponents.splice(idx, 1);
        }
    }

    /**
     * 分发事件
     * @param {GameEventBase} event
     */
    dispatchEvent(event: GameEventBase) {
        for (let i = 0; i < this.allComponents.length; i++) {
            let component = this.allComponents[i];
            if (component.onReceiveEvent(event) == true) {
                break;
            }
        }
    }
}
