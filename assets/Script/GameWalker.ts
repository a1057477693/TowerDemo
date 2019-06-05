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
import v2 = cc.v2;
import {GameActorStatusBase, GameActorStatusType, GameActorStatusWalk} from "./GameActorStatusMachine";
import {GameConfig, GameDirection} from "./Config";
import Util from "./Util";
import GameHpBar from "./GameHpBar";
import {GameEventHit, GamEventType} from "./GameEventDefine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameWalker extends GameActor {

    @property(cc.Prefab)
    prefabHp: cc.Prefab = null;

    @property(cc.Sprite)
    spWalk: cc.Sprite = null;

    @property([cc.SpriteFrame])
    sfWalkUp: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    sfWalkRight: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    sfWalkDown: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    sfDie: cc.SpriteFrame[] = [];

    @property(Number)
    animWalkTotalTime: number = 1;  //行走动画播放时间

    @property(Number)
    animDieTotalTime: number = 1;

    speed: number = 0;     //行走的速度

    paths: cc.Vec2[];      //行走的路径

    hpBar: GameHpBar = null;

    onLoad() {
        super.onLoad();

        //使用配置表数据
        let config = GameConfig.config.walker.thief;
        for (let key in config) {
            console.log("读取盗贼的配置：", key, config[key]);
            this[key] = config[key];
        }
        console.log("读取法盗贼的配置：", this.maxHp, this.speed);

        let hp = cc.instantiate(this.prefabHp).getComponent("GameHpBar")as GameHpBar;
        hp.node.setParent(this.node);
        hp.node.y = this.node.y + 100;
        this.hpBar = hp;

        //注册攻击事件
        this.eventComponent.registEvent(GamEventType.Hit, this.onHit);
    }

    /**
     * 获取路径
     * @returns {cc.Vec2[]}
     */
    getPath(): cc.Vec2[] {
        // let path: cc.Vec2[] = [];
        // path.push(cc.v2(0, 0));
        // path.push(cc.v2(50, 50));
        // path.push(cc.v2(-100, 30));
        // path.push(cc.v2(-100, 100));
        // path.push(cc.v2(-10, -100));

        return this.paths;
    }

    /**
     * 重写父类函数
     * @param {GameActorStatusBase} status
     */
    preferStatus(status: GameActorStatusBase) {
        super.preferStatus(status);
        let walkStatus = status as GameActorStatusWalk;
        if (status.status == GameActorStatusType.Walk) {

            let percent = (walkStatus.statusTime / this.animWalkTotalTime) % 1;//只保留小数部分

            let spriteFromes: cc.SpriteFrame[] = [];

            let scaleX = 1;
            if (walkStatus.dir == GameDirection.Up) {
                spriteFromes = this.sfWalkUp;
            } else if (walkStatus.dir == GameDirection.Down) {
                spriteFromes = this.sfWalkDown;
            } else if (walkStatus.dir == GameDirection.Left) {
                spriteFromes = this.sfWalkRight;
                scaleX = -1;
            } else {
                spriteFromes = this.sfWalkRight;
            }

            Util.preferAnimFrame(this.spWalk, spriteFromes, percent);

            this.spWalk.node.scaleX = scaleX;

        } else if (status.status == GameActorStatusType.Die) {

            this.node.getChildByName("prefabHpbar").active = false;

            let percent = Math.min(1, (walkStatus.statusTime / this.animDieTotalTime));

            Util.preferAnimFrame(this.spWalk, this.sfDie, percent);
        }
    }

    /**
     * 响应收到攻击事件的函数
     * @param {GameEventHit} event
     * @returns {boolean}
     */
    onHit(event: GameEventHit): boolean {
        //判断收到攻击是否是自己
        if (event.beHitter == this) {
            this.currHp -= event.hitter.power;
            this.hpBar.setHpPerent(this.currHp / this.maxHp);
        }

        return false;
    }


}
