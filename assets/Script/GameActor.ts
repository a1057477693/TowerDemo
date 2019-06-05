// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameActorStatusBase, default as GameActorStatusMachine, GameActorStatusAttack} from "./GameActorStatusMachine";
import {GameDirection} from "./Config";
import Util from "./Util";
import SelectLevels from "./SelectLevels";
import GameListener from "./GameEventListener";

const {ccclass, property, requireComponent} = cc._decorator;

@ccclass
export default class GameActor extends GameListener {


    machine: GameActorStatusMachine = null;

    attackCoolDownTime: number = 1;//冷却时间

    attackAnimTotalTime: number = 1;//攻击动画时间
    @property(Number)
    attackKeyFrame: number = 7; //真正攻击的帧数


    attackRange: number = 250;  //攻击范围


    power: number = 10;       //攻击力

    maxHp: number = 100;     //最大生命值

    currHp: number = 0;      //当前生命值

    onLoad() {
        super.onLoad();
        this.machine = new GameActorStatusMachine(this);
        this.currHp = this.maxHp;
    }


    /**
     *根据传来的状态展示相应的图像
     * @param {GameActorStatusBase} status
     */
    preferStatus(status: GameActorStatusBase) {

    }

    /**
     * 获取范围内敌人
     * @returns {GameActor[]}
     */
    getEnemysInRange(): GameActor[] {
        let enemysInRange: GameActor[] = [];

        for (let i = 0; i < SelectLevels.getInstance().enemys.length; i++) {
            let enemy = SelectLevels.getInstance().enemys[i];

            if (!enemy.isDie() && this.node.position.sub(enemy.node.position).mag() < this.attackRange) {
                enemysInRange.push(enemy);
            }
        }

        return enemysInRange;
    }

    /**
     * 获取敌人方向
     * @param {GameActor[]} enemys
     * @returns {GameDirection}
     */
    getEnemyDir(enemys: GameActor[]): GameDirection {

        let enemy = enemys[0];


        return Util.getDir(enemy.node.position.sub(this.node.position));
    }

    /**
     * 攻击
     */
    attack() {

        let attackStatus = this.machine.currentStatus as GameActorStatusAttack;
        attackStatus.isAttacker = true;

        console.log("开始攻击");
    }

    /**
     * 是否死亡
     * @returns {boolean}
     */
    isDie(): boolean {
        return this.currHp <= 0;
    }


    update(dt: number) {
        this.machine.update(dt);
    }

}
