// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import error = cc.error;

const {ccclass, property} = cc._decorator;

@ccclass
export default class GamePoolManager extends cc.Component {


    private static _instance: GamePoolManager = null;

    static getInstance(): GamePoolManager {
        return GamePoolManager._instance;
    }

    @property([cc.Prefab])
    prefabs: cc.Prefab[] = [];

    allPools: Map<PoolType, cc.Node[]> = new Map<PoolType, cc.Node[]>();

    onLoad() {
        if (GamePoolManager._instance == null) {
            GamePoolManager._instance = this;
        } else {
            throw  new Error("GamePoolManager  is exit");
        }

    }

    getObject(poolType: PoolType): cc.Node {
        let pool: cc.Node[] = this.allPools.get(poolType);

        if (!pool) {
            pool = [];
            this.allPools.set(poolType, pool);
        }

        if (pool.length > 0) {
            console.log(`使用了对象池中的   剩余${pool.length}`)
            return pool.shift();
        } else {
            console.log(`创建了一个对象`);
            return cc.instantiate(this.prefabs[poolType]);
        }

    }

    recyleObject(poolType: PoolType, node: cc.Node) {
        this.allPools.get(poolType).push(node);
    }

}

export  enum PoolType {
    None,
    MegaTowerFlyObject,
}
