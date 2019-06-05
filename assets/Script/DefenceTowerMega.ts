// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import GameActor from "./GameActor";
import {GameActorStatusAttack, GameActorStatusBase, GameActorStatusType} from "./GameActorStatusMachine";
import {GameConfig, GameDirection} from "./Config";
import Util from "./Util";
import GameFlyObject from "./GameFlyObject";
import {default as GamePoolManager, PoolType} from "./GamePoolManager";

const {ccclass, property} = cc._decorator;


@ccclass
export default class DefenceTowerMega extends GameActor {

    @property(cc.Prefab)
    prefabFlyObject: cc.Prefab = null;

    @property(cc.Sprite)
    spMega: cc.Sprite = null;
    @property(cc.Sprite)
    spTower: cc.Sprite = null;

    @property(cc.SpriteFrame)
    sfMegaIdleFront: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfMegaIdleBase: cc.SpriteFrame = null;
    @property([cc.SpriteFrame])
    sfMegaAttackFront: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sfMegaAttacksBase: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    sfTowerIdleBase: cc.SpriteFrame = null;
    @property([cc.SpriteFrame])
    sfTowerAttack: cc.SpriteFrame[] = [];


    onLoad() {
        super.onLoad();

        //使用配置表数据
        let config = GameConfig.config.towers.mega;
        for (let key in config) {
            console.log("读取法师塔的配置：",key , config[key]);
            this[key] = config[key];
        }
        console.log("读取法师塔的配置：",this.attackRange , this.power);
    }

    /**
     * 重写父类函数
     * @param {GameActorStatusBase} status
     */
    preferStatus(status: GameActorStatusBase) {
        super.preferStatus(status);

        if (status.status == GameActorStatusType.Attack) {

            let attackStatus = status as GameActorStatusAttack;

            let percent = (status.statusTime / this.attackAnimTotalTime) % 1;

            let frames = attackStatus.dir == GameDirection.Up ? this.sfMegaAttacksBase : this.sfMegaAttackFront;
            let currFrame = Util.preferAnimFrame(this.spMega, frames, percent);

            if (!attackStatus.isAttacker && currFrame == frames[this.attackKeyFrame]) {
                this.attack();
            }


        }
    }

    /**
     * 重写父类函数
     * @param {GameActor[]} enemys
     * @returns {GameDirection} 法师塔的小人只有两个方向 上  下
     */
    getEnemyDir(enemys: GameActor[]): GameDirection {
        super.getEnemyDir(enemys);
        let enemy = enemys[0];

        if (enemy.node.y > this.node.y) {
            return GameDirection.Up;
        } else {
            return GameDirection.Down;
        }
    }

    /**
     * 重写父类函数
     */
    attack() {
        super.attack();
        let emeys = this.getEnemysInRange();
        if (emeys && emeys.length > 0) {
            let flyObject = GamePoolManager.getInstance().getObject(PoolType.MegaTowerFlyObject).getComponent("GameFlyObject") as GameFlyObject;
            flyObject.node.setParent(this.node.parent);
            flyObject.node.position = cc.v2(this.node.x, this.node.y + 100);
            flyObject.startFly(emeys[0], this);
        }
    }


}
