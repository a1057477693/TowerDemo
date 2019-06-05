// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {DefenceTowerType} from "./Config";
import {GameEventCreateTower} from "./GameEventDefine";
import GameEventDispatcher from "./GameEventDispatcher";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TowerCreate extends cc.Component {

    //1archer  箭塔    2 barrack 兵营   3 mage  法师塔   4 artillery  炮塔
    //初始状态
    @property(cc.Node)
    commonBg: cc.Node = null;

    //光圈（攻击范围）图片
    @property(cc.Node)
    nodeRangParent: cc.Node = null;

    //预览要建造塔的图片
    @property(cc.Node)
    nodePreviewParent: cc.Node = null;
    @property([cc.Node])
    nodePreviews: cc.Node[] = [];

    //选择要建造塔的类型
    @property(cc.Node)
    nodeSelectorParent: cc.Node = null;
    @property([cc.Node])
    nodeSelector: cc.Node[] = [];

    //正在建造的塔
    @property(cc.Node)
    nodeConstructorParent: cc.Node = null;
    @property([cc.Node])
    nodeConstructoring: cc.Node[] = [];

    //建造塔的进度条
    @property(cc.Node)
    nodeBarParent: cc.Node = null;
    @property(cc.Sprite)
    spBar: cc.Sprite = null;

    //当前选择防御塔的类型
    currentSeclectTower: DefenceTowerType = DefenceTowerType.None;

    //当前防御塔的状态
    status: TowerCreateStatus = TowerCreateStatus.None;

    /**
     * 设置防御塔的状态
     * @param {TowerCreateStatus} status
     */
    setStatus(status: TowerCreateStatus) {
        //根据设置状态 部分节点显示或者隐藏
        this.commonBg.active = status == TowerCreateStatus.Common || status == TowerCreateStatus.SelectTower;
        this.nodeRangParent.active = status == TowerCreateStatus.ClickSelectTower;
        this.nodePreviewParent.active = status == TowerCreateStatus.ClickSelectTower;
        this.nodeSelectorParent.active = status == TowerCreateStatus.SelectTower || status == TowerCreateStatus.ClickSelectTower;
        this.nodeConstructorParent.active = status == TowerCreateStatus.Constructing;
        this.nodeBarParent.active = status == TowerCreateStatus.Constructing;

        this.status = status;
    }

    /**
     * 设置当前选择的防御塔的类型
     * @param {DefenceTowerType} towerType
     */
    setCurrentSeclectTower(towerType: DefenceTowerType) {
        this.currentSeclectTower = towerType;
    }

    /**
     * 刷新节点显示
     */
    refreshCurrentStatus() {
        for (let i = 0; i < this.nodePreviews.length; i++) {
            if (this.nodePreviews[i]) {
                this.nodePreviews[i].active = this.currentSeclectTower == i;
            }
        }

        for (let i = 0; i < this.nodeSelector.length; i++) {
            if (this.nodeSelector[i]) {
                this.nodeSelector[i].children[0].children[0].active = this.currentSeclectTower == i;
            }
        }

        for (let i = 0; i < this.nodeConstructoring.length; i++) {
            if (this.nodeConstructoring[i]) {
                this.nodeConstructoring[i].active = this.currentSeclectTower == i;
            }
        }
    }

    /////////////////////////////////////////////////
    ////点击事件，后期优化下
    ////////////////////////////////////////////////
    onClickCommBg() {
        this.setStatus(TowerCreateStatus.SelectTower);
    }

    onClickSelectTower(event: cc.Event.EventCustom, data: string) {
        this.setStatus(TowerCreateStatus.ClickSelectTower);
        this.setCurrentSeclectTower(parseInt(data));
        this.refreshCurrentStatus();
        event.getCurrentTarget().children[0].active = true;
    }

    onClickCreateTower(event: cc.Event.EventCustom, data: string) {
        this.setStatus(TowerCreateStatus.Constructing);
        this.setCurrentSeclectTower(parseInt(data));
    }

    //////////////////////////////////////////////////
    startConStructoring() {
        console.log("正在建造---");
    }


    update(dt: number) {
        if (this.status == TowerCreateStatus.Constructing) {
            this.spBar.fillRange += dt;
            this.spBar.fillRange = Math.min(1, this.spBar.fillRange);
            if (this.spBar.fillRange == 1) {
                console.log("建造完成！")//TODO通知主控 建造完成
                this.status = TowerCreateStatus.None;


                let event = new GameEventCreateTower();
                event.towerType = this.currentSeclectTower;
                event.pos = this.node.position;
                GameEventDispatcher.getInstance().dispatchEvent(event);

                this.node.removeFromParent(true);
            }
        }
    }


}

/**
 * 防御塔状态
 */
export enum TowerCreateStatus {
    None,
    Common,
    SelectTower,
    ClickSelectTower,
    Constructing,

}