// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameDirection} from "./Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Util {

    /**
     * 将TiledMap中的坐标装换为Cocos坐标
     * @param {cc.TiledMap} map  地图对象
     * @param {cc.Vec2} pos      要获取的地图中的对象的offset 坐标
     * @returns {cc.Vec2}  Cocos坐标
     */
    static titledCoordForPosition(map: cc.TiledMap, pos: cc.Vec2): cc.Vec2 {
        let mapSize = map.getMapSize();
        let tileSize = map.getTileSize();

        let x = pos.x - mapSize.width * tileSize.width * 0.5;
        let y = -pos.y + mapSize.height * tileSize.height * 0.5;

        return cc.v2(x, y);
    }

    /**
     * 将TiledMa中折线点坐标转换为Cocos坐标
     * @param {cc.Vec2} startPos  第一个点的坐标 这里已将转化为Cococs坐标
     * @param {cc.Vec2[]} polylinePoints
     * @returns {cc.Vec2[]}
     */
    static titlePolylineForPositions(startPos: cc.Vec2, polylinePoints: cc.Vec2[]): cc.Vec2[] {
        let paths: cc.Vec2[] = [];
        paths[0] = startPos;
        for (let i = 1; i < polylinePoints.length; i++) {
            paths[i] = cc.v2(startPos.x + polylinePoints[i].x, startPos.y - polylinePoints[i].y);
        }
        return paths;
    }

    /**
     * 获取方向
     * @param {cc.Vec2} vec2
     * @returns {GameDirection}
     */

    static getDir(vec2: cc.Vec2): GameDirection {

        // 1.9 的写法是 :let angle=cc.radiansToDegress(cc.pToAngle(cc.pSub(to,from)));
        //一下是2.0以上版本的写法
        let angle = cc.misc.radiansToDegrees(Math.atan2(vec2.y, vec2.x));


        if (angle > 360) {
            angle -= 360;
        } else if (angle < 0) {
            angle += 360;
        }
        if (angle > 45 && angle < 135) {
            return GameDirection.Up;
        } else if (angle > 135 && angle < 225) {
            return GameDirection.Left;
        } else if (angle > 225 && angle < 315) {
            return GameDirection.Down;
        } else {
            return GameDirection.Right;
        }

    }

    /**
     * 播放帧动画
     * @param {cc.Sprite} sprite
     * @param {cc.SpriteFrame[]} frames
     * @param {number} percent
     * @returns {cc.SpriteFrame}
     */

    static preferAnimFrame(sprite: cc.Sprite, frames: cc.SpriteFrame[], percent: number): cc.SpriteFrame {
        sprite.spriteFrame = frames[Math.floor(frames.length * percent)];

        return sprite.spriteFrame;
    }

    /**
     * 动态遮挡问题
     * y值越低zIndex越大
     * @param {cc.Node[]} nodes
     */
    static orderPosY(nodes: cc.Node[]) {

         nodes.sort(this.order);

    }

    static order(node0: cc.Node, node1: cc.Node):number {
          if(node0.y>node1.y){
              return -1;
          }else{
              return 1;
          }
    }
}
