// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameDirection} from "./Config";
import GameActor from "./GameActor";
import GameWalker from "./GameWalker";
import Util from "./Util";
import {GameEventDie} from "./GameEventDefine";
import GameEventDispatcher from "./GameEventDispatcher";

/**
 * Actor状态机类
 */
export default class GameActorStatusMachine {
    currentStatus: GameActorStatusBase = null;

    actor: GameActor = null;

    constructor(actor: GameActor) {
        this.actor = actor;
    }

    //改变当前状态
    onStatusChange(status: GameActorStatusBase) {

        if (this.currentStatus) {
            this.currentStatus.onExitStatus();
        }
        this.currentStatus = status;
        this.currentStatus.machine = this;
        this.currentStatus.onEnterStatus();
    }

    update(dt: number) {
        if (this.currentStatus) {
            this.currentStatus.update(dt);
        }
    }

}

//状态 的基类
export class GameActorStatusBase {
    status: GameActorStatusType = GameActorStatusType.None;
    machine: GameActorStatusMachine = null;

    statusTime: number = 0;  //状态持续时间

    onEnterStatus() {

    }

    onExitStatus() {
        this.machine = null;
    }

    update(dt: number) {
        this.statusTime += dt;
    }
}

//空闲状态
export class GameActorStatusIdle extends GameActorStatusBase {
    status: GameActorStatusType = GameActorStatusType.Idle;

    onEnterStatus() {
        super.onEnterStatus();
        this.machine.actor.preferStatus(this);
    }

    update(dt: number) {
        super.update(dt);
        let enemys = this.machine.actor.getEnemysInRange();
        //攻击范围内出现敌人&& 状态时间>攻击冷却时间 便开始攻击
        if (enemys && enemys.length > 0 && this.statusTime > this.machine.actor.attackCoolDownTime) {
            //转入攻击状态
            let attack = new GameActorStatusAttack();

            this.machine.onStatusChange(attack);
            //获取敌人方向
            attack.dir = attack.getEnemyDir(enemys);

        }
    }

}

//行走状态
export class GameActorStatusWalk extends GameActorStatusBase {
    status: GameActorStatusType = GameActorStatusType.Walk;

    path: cc.Vec2[];  //行走路径
    currentPathPointIndex: number = 0; //行走到第几个路径点
    nextPathPoint: cc.Vec2;    //下一个路径点的左边
    moveDir: cc.Vec2;      // 行走的弧度
    dir: GameDirection;  //行走的方向

    onEnterStatus() {
        super.onEnterStatus();
        //赋值
        this.path = (this.machine.actor as GameWalker).getPath();
        this.currentPathPointIndex = 0;
        //
        this.goToNextPoint();
    }

    /**
     * 到下一个路径点
     */
    goToNextPoint() {
        this.nextPathPoint = this.getNextPathPoint();

        if (this.nextPathPoint) {
            //1.9 的写法是cc.pNormalize(cc.pSub(this.nextPathPoint,this.machine.actor.node.position));
            //一下是2.0以上版本的写法
            this.moveDir = (this.nextPathPoint.sub(this.machine.actor.node.position)).normalize();

            this.dir = this.getDir(this.machine.actor.node.position, this.nextPathPoint);

            this.currentPathPointIndex++;
        }
    }

    /**
     * 获取下个路径点的坐标
     * @returns {cc.Vec2}
     */
    getNextPathPoint(): cc.Vec2 {
        if (this.currentPathPointIndex + 1 < this.path.length) {
            return this.path[this.currentPathPointIndex + 1];
        }
        return null;
    }

    /**
     * 获取方向
     * @param {cc.Vec2} from 现在的坐标
     * @param {cc.Vec2} to  要到达的坐标点
     * @returns {GameDirection}
     */
    getDir(from: cc.Vec2, to: cc.Vec2): GameDirection {

        let subValue = to.sub(from);
        return Util.getDir(subValue);

    }

    update(dt: number) {
        super.update(dt);

        if (this.machine.actor.isDie()) {
            let die = new GameActorStatusDie();

            this.machine.onStatusChange(die);
            return;
        }

        this.machine.actor.preferStatus(this);

        if (!this.nextPathPoint) {
            return;
        }

        let currentPos = this.machine.actor.node.position;
        let speed = (this.machine.actor as GameWalker).speed;

        // 1.9 的写法是cc.clampf(currentPos.x+this.moveDir.x*dt*speed,Math.min(currentPos.x,this.nextPathPoint.x),Math.max(currentPos.x,this.nextPathPoint.x));
        //一下是2.0以上版本的写法
        this.machine.actor.node.x = cc.misc.clampf(currentPos.x + this.moveDir.x * dt * speed,
            Math.min(currentPos.x, this.nextPathPoint.x), Math.max(currentPos.x, this.nextPathPoint.x));
        this.machine.actor.node.y = cc.misc.clampf(currentPos.y + this.moveDir.y * dt * speed,
            Math.min(currentPos.y, this.nextPathPoint.y), Math.max(currentPos.y, this.nextPathPoint.y));

        //到达目标点就向下一个目标点行走
        if (this.machine.actor.node.x == this.nextPathPoint.x && this.machine.actor.node.y == this.nextPathPoint.y) {
            this.goToNextPoint();
        }
    }
}

//攻击状态
export class GameActorStatusAttack extends GameActorStatusBase {
    status: GameActorStatusType = GameActorStatusType.Attack;

    dir: GameDirection;  //攻击方向

    isAttacker: boolean = false; //是否攻击过

    onEnterStatus() {
        super.onEnterStatus();
    }

    update(dt: number) {
        super.update(dt);

        this.machine.actor.preferStatus(this);
        let percent = this.statusTime / this.machine.actor.attackAnimTotalTime;

        //如果攻击完就转入空闲状态
        if (percent > 1) {
            let idle = new GameActorStatusIdle();
            this.machine.onStatusChange(idle);
        }
    }

    /**
     * 获取敌人方向
     * @param {GameActor[]} enemys
     * @returns {GameDirection}
     */
    getEnemyDir(enemys: GameActor[]): GameDirection {

        return this.machine.actor.getEnemyDir(enemys);
    }

}

//死亡状态
export class GameActorStatusDie extends GameActorStatusBase {
    status: GameActorStatusType = GameActorStatusType.Die;

    onEnterStatus() {
        //分发死亡事件
        let event = new GameEventDie();
        event.actor = this.machine.actor;
        GameEventDispatcher.getInstance().dispatchEvent(event);
    }


    update(dt: number) {
        super.update(dt);
        if (this.statusTime > 2) {
            this.machine.actor.node.destroy();
        }

        this.machine.actor.preferStatus(this);
    }
}

export  enum GameActorStatusType {
    None,
    Idle,//空闲
    Walk,//行走
    Attack,//攻击
    Die,//死亡

}