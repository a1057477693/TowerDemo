// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import Util from "./Util";
import TowerCreate, {TowerCreateStatus} from "./TowerCreate";
import GameWalker from "./GameWalker";
import Game = cc.Game;
import {GameActorStatusIdle, GameActorStatusWalk} from "./GameActorStatusMachine";
import GameActor from "./GameActor";
import DefenceTowerMega from "./DefenceTowerMega";
import {GameEventCreateTower, GameEventDie, GameEventHit, GamEventType} from "./GameEventDefine";
import {DefenceTowerType, GameConfig} from "./Config";
import GameListener from "./GameEventListener";
import GamePoolManager from "./GamePoolManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SelectLevels extends GameListener {

    private static _instance: SelectLevels = null;

    static getInstance(): SelectLevels {
        return SelectLevels._instance;
    }


    @property(cc.TiledMap)
    map: cc.TiledMap = null;
    @property(cc.Node)
    towerParentNode: cc.Node = null;
    @property(cc.Prefab)
    towerPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    enemy0: cc.Prefab = null;

    @property(cc.Prefab)
    prefabTowerMega: cc.Prefab = null;


    @property(cc.Prefab)
    prefabPoolManager: cc.Prefab = null;


    enemys: GameActor[] = [];

    onLoad() {
        super.onLoad();

        SelectLevels._instance = this;
        //加载配置表
        GameConfig.loadConfig();

    }


    /**
     * 开始游戏
     */
    startGame() {
        //创建对象池
        let poolManager = cc.instantiate(this.prefabPoolManager).getComponent("GamePoolManager") as GamePoolManager;
        poolManager.node.setParent(this.node);
        //注册事件
        this.eventComponent.registEvent(GamEventType.CreateTower, this.onEnentCreateTower);
        this.eventComponent.registEvent(GamEventType.Die, this.onEnentDie);


        this.generateTowerCreate();

        //敌人出动
        this.schedule(this.generateEnemys, 1, 20, 2);
    }

    /**
     * 响应建造好塔的事件
     * @param {GameEventCreateTower} event
     * @returns {boolean}
     */
    onEnentCreateTower(event: GameEventCreateTower): boolean {

        let towerType = event.towerType;
        if (towerType == DefenceTowerType.Mage) {
            let tower = cc.instantiate(this.prefabTowerMega).getComponent("DefenceTowerMega") as DefenceTowerMega;
            tower.node.setParent(this.towerParentNode);
            tower.node.position = event.pos;
            tower.machine.onStatusChange(new GameActorStatusIdle());
        }

        return false;
    }

    /**
     * 响应死亡事件
     * @param {GameEventDie} event
     * @returns {boolean}
     */
    onEnentDie(event: GameEventDie): boolean {
        let index = this.enemys.indexOf(event.actor);
        if (index != -1) {
            this.enemys.splice(index, 1);
        }
        return false;
    }

    /**
     * 生产敌人
     */
    generateEnemys() {
        let paths = this.map.getObjectGroup("paths");
        let path0 = paths.getObject("path0");

        let enemy0 = cc.instantiate(this.enemy0).getComponent("GameWalker") as GameWalker;
        enemy0.node.setParent(this.towerParentNode);
        let startPos = Util.titledCoordForPosition(this.map, path0.offset);
        enemy0.node.position = startPos;
        enemy0.paths = Util.titlePolylineForPositions(startPos, path0.polylinePoints);
        this.enemys.push(enemy0);

        let walker = new GameActorStatusWalk();
        enemy0.machine.onStatusChange(walker);
    }

    /**
     *显示地图所以塔的基座
     */
    generateTowerCreate() {
        let towers = this.map.getObjectGroup("towers");
        let groups = towers.getObjects();
        for (let i = 0; i < groups.length; i++) {
            let tower = groups[i];
            let createTower = cc.instantiate(this.towerPrefab).getComponent("TowerCreate") as TowerCreate;
            createTower.node.setParent(this.towerParentNode);
            createTower.node.position = Util.titledCoordForPosition(this.map, tower.offset);
            createTower.setStatus(TowerCreateStatus.Common);
        }

    }

    update(dt: number) {

        //动态遮挡问题
        let nodes: cc.Node[] = [];

        for (let i = 0; i < this.enemys.length; i++) {
            let enemy = this.enemys[i];
            nodes.push(enemy.node);
        }
        Util.orderPosY(nodes);
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.zIndex = i;
        }
    }

}
