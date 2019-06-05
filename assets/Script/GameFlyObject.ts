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
import Util from "./Util";
import GameWalker from "./GameWalker";
import {GameEventHit} from "./GameEventDefine";
import GameEventDispatcher from "./GameEventDispatcher";
import {default as GamePoolManager, PoolType} from "./GamePoolManager";

const {ccclass, property} = cc._decorator;
const POOLTYPEENUM = cc.Enum(PoolType);
@ccclass
export default class GameFlyObject extends cc.Component {

    @property(cc.Sprite)
    spImage: cc.Sprite = null;
    @property([cc.SpriteFrame])
    sfFlys: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    sfExplosions: cc.SpriteFrame[] = [];

    @property({type: POOLTYPEENUM})
    flyPoolType: PoolType = PoolType.None;

    targer: GameActor = null;//目标者
    trigger: GameActor = null;//触发者

    speed: number = 400; //飞行器的速度

    statusTime: number = 0; //状态持续时间

    flyAnimTime: number = 0.5;  //飞行动画总时间
    explosionsAnimTime: number = 0.5; //爆炸动画总时间

    statusType: GameFlyObjectStatus = GameFlyObjectStatus.None; //当前状态

    onLoad() {

    }

    /**
     * 开始飞行
     * @param {GameActor} targer
     * @param {GameActor} trigger
     */
    startFly(targer: GameActor, trigger: GameActor) {
        this.targer = targer;
        this.trigger = trigger;
        this.statusTime = 0;
        this.statusType = GameFlyObjectStatus.Fly;
    }

    update(dt: number) {
        this.statusTime += dt;

        if (this.statusType == GameFlyObjectStatus.Fly) {
            //播放飞行动画
            let perent = (this.statusTime / this.flyAnimTime) % 1;
            Util.preferAnimFrame(this.spImage, this.sfFlys, perent);


            let currentPos = this.node.position;
            let speed = this.speed;
            let dir = (this.targer.node.position.sub(this.node.position)).normalize();
            let angle = cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));


            this.node.rotation = -angle;

            this.node.x = cc.misc.clampf(currentPos.x + dir.x * dt * speed,
                Math.min(currentPos.x, this.targer.node.x), Math.max(currentPos.x, this.targer.node.x));
            this.node.y = cc.misc.clampf(currentPos.y + dir.y * dt * speed,
                Math.min(currentPos.y, this.targer.node.y), Math.max(currentPos.y, this.targer.node.y));

            //发到目标点
            if (this.node.x == this.targer.node.x && this.node.y == this.targer.node.y) {
                this.statusTime = 0;
                this.statusType = GameFlyObjectStatus.Explosions;

                //分发攻击事件
                let event = new GameEventHit();
                event.hitter = this.trigger;
                event.beHitter = this.targer;

                GameEventDispatcher.getInstance().dispatchEvent(event);
            }

        } else if (this.statusType == GameFlyObjectStatus.Explosions) {

            //播放爆炸动画
            let perent = this.statusTime / this.explosionsAnimTime;
            Util.preferAnimFrame(this.spImage, this.sfExplosions, perent);
            //只播放一次就销毁
            if (perent > 1) {

                //this.node.destroy();

                //现在不销毁而是放到回收池中
                this.node.removeFromParent(false);
                GamePoolManager.getInstance().recyleObject(this.flyPoolType, this.node);
            }


        }

    }
}

export enum GameFlyObjectStatus {
    None,
    Fly,
    Explosions,
}
