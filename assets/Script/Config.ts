//1archer  箭塔    2 barrack 兵营   3 mage  法师塔   4 artillery  炮塔
import SelectLevels from "./SelectLevels";

export  enum DefenceTowerType {
    None,
    Archer,
    Barrack,
    Mage,
    Artillery,
}

//方向
export  enum GameDirection {
    None,
    Up,
    Down,
    Left,
    Right,
}

/**
 * 用来读取配置表的工具类
 */
export class GameConfig {
    static config: any = null;

    static loadConfig() {
        cc.loader.loadRes("config", (error, resource) => {
            console.log(resource);
            GameConfig.config = resource.json;

            //读取完配置才开始游戏
            SelectLevels.getInstance().startGame();
        });
    }

}
