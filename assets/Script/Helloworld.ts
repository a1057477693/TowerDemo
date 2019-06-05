import GameWalker from "./GameWalker";
import {GameActorStatusWalk} from "./GameActorStatusMachine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Prefab)
    enemy: cc.Prefab = null;

    start () {


        let enm=cc.instantiate(this.enemy).getComponent("GameWalker") as GameWalker;
        enm.node.setParent(this.node);

        let walker=new GameActorStatusWalk();
        enm.machine.onStatusChange(walker);

    }
}
