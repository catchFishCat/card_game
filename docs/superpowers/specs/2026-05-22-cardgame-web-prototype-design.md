# 《福瑞勇者从不战败》Web 原型设计文档

日期：2026-05-22

## 目标

制作《福瑞勇者从不战败》的第一版 Web 可玩原型。

第一版原型要验证核心循环：

1. 播放一段剧情。
2. 进入卡牌交互。
3. 通过卡牌交互触发下一段剧情。

首批内容覆盖 `1-1` 和 `1-2`。

## 参考资料

主要飞书资料：

- 知识库空间：[福瑞勇者从不战败](https://my.feishu.cn/wiki/space/7390585220017209345?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home)
- 策划案：[策划案](https://my.feishu.cn/wiki/N0luwJS2Ji6YzTkBJl4c3YCbnCh)
- 系统案：[系统案](https://my.feishu.cn/wiki/BPZiwa0wMieu1hkq0cFcE3Xan8e)
- 玩法案：[玩法案](https://my.feishu.cn/wiki/OlIlwaVygifLIIkAyOGcZG7EnVg)
- 剧情表：[剧情TimeLine](https://my.feishu.cn/wiki/WIO4wyf7hiU5yAkTBGucsE0fnee)
- 探索流程总览：[探索TimeLine](https://my.feishu.cn/wiki/S0LuwnautihkY7kX8y9cNJOEnue)
- 探索流程 1-1：[1-1](https://my.feishu.cn/wiki/GyUZwSo0WiY8t9kLTjFc9eipnke)
- 探索流程 1-2：[1-2](https://my.feishu.cn/wiki/Zo3ZwbccOiad1lkIJJScpwyjnye)

已从系统案下载到本地的参考图：

- `docs/reference-images/system-normal-explore.png`
- `docs/reference-images/system-story-view.png`
- `docs/reference-images/system-card-detail.png`

现有卡牌风格参考：

- `洛德_720.png`

## 已确认约束

- 第一版使用 Web 实现。
- 第一版采用数据驱动方案，不把 `1-1`、`1-2` 写死在组件逻辑里。
- 编辑器是后续确定要做的功能，但不包含在第一版原型内。
- 数据结构从一开始就要方便未来编辑器读取和写入。
- 卡牌进度条是可选设计，只用于部分有读条、蓄力、进度反馈需求的卡牌。
- 普通卡牌不显示进度条。
- 卡牌美术素材只生成“牌面插画”部分。
- 卡牌名、卡牌类型、持有数量、可选进度条、描述文本等内容由前端 UI 根据数据动态渲染。

## 架构设计

第一版原型分为四个核心运行层。

### StoryPlayer

负责读取剧情段数据，并按顺序播放剧情步骤。

剧情步骤可以包括：

- 旁白
- 角色台词
- 黑屏、眨眼、淡入淡出、屏幕震动、镜头聚焦等效果
- 生成卡牌
- 移动或显示卡牌
- 进入剧情界面
- 退出剧情界面
- 弹出取名框
- 跳转到下一段剧情

### CardBoard

负责系统案中的探索界面。

界面分为两个主要区域：

- 顶部系统固定卡牌区：用于地点、重要角色、提示等系统卡牌。
- 下方其他卡牌区：用于玩家可拖动的普通卡牌。

固定卡牌区按系统规则排列，新出现的固定卡牌按时间顺序加入。其他卡牌区中的卡牌可由玩家自由拖动。同名卡牌可以堆叠，并增加持有数量。

### InteractionEngine

负责判断卡牌交互，并产出交互结果。

一条交互规则描述：

- 来源卡牌
- 目标卡牌或目标区域
- 可选触发条件
- 触发后的结果

示例：把技能卡 `我` 拖到 `主角卡` 上，会触发 `1-1` 的融合演出，然后打开取名框。

### GameState

负责保存运行时状态：

- 当前剧情段
- 已生成卡牌
- 卡牌位置
- 卡牌数量
- 卡牌堆叠状态
- 玩家名字
- 当前是否处于剧情模式
- 剧情模式下哪些卡牌允许交互

## 数据模型

### CardDefinition

卡牌静态定义。

字段包括：

- `id`
- `name`：卡牌显示名，例如 `主角卡`、`地点：树`。
- `type`：卡牌类型，例如 `主角`、`技能`、`地点`、`物品`、`角色`、`提示`。
- `description`：卡牌详情描述。
- `art`：牌面插画资源，只指向图片，不包含卡名、类型、数量等 UI 文本。
- `zone`：固定区或自由区
- `stackable`：是否允许同名堆叠。
- `defaultCount`：初始数量，默认为 `1`。
- `defaultPosition`：首次生成时的建议位置，方便还原探索画板布局。
- `tags`：用于规则匹配的标签，例如 `location`、`skill`、`body`。
- `highlight`：被高亮时的表现配置，例如描边、发光、可投放提示。
- `interactions`：卡牌交互索引，用于快速判断拿起某张卡后哪些卡牌需要高亮。
- 可选 `progress`

普通卡牌没有 `progress` 字段。只有配置了 `progress` 的卡牌才渲染进度条和相关数值。

`interactions` 不直接写具体剧情结果，只保存与规则的关系索引，具体交互结果由 `InteractionRule` 维护。这样可以避免同一条规则同时散落在来源卡和目标卡两处。

建议结构：

```ts
type CardDefinition = {
  id: string;
  name: string;
  type: 'protagonist' | 'skill' | 'location' | 'item' | 'character' | 'hint';
  description?: string;
  art?: string;
  zone: 'fixed' | 'free';
  stackable?: boolean;
  defaultCount?: number;
  defaultPosition?: { x: number; y: number };
  tags?: string[];
  progress?: {
    kind: 'read' | 'charge' | 'duration' | 'custom';
    max: number;
    initial?: number;
  };
  highlight?: {
    mode: 'outline' | 'glow' | 'pulse';
    color?: string;
  };
  interactions?: {
    asSourceRuleIds?: string[];
    asTargetRuleIds?: string[];
  };
};
```

### CardInstance

运行时卡牌实例。

同一个 `CardDefinition` 可以生成多个实例，但同名堆叠时也可以表现为一个实例加数量。

字段包括：

- `instanceId`
- `definitionId`
- `zone`
- `position`
- `count`
- `progressValue`
- `visible`
- `enabled`
- `highlightState`

`highlightState` 是运行时状态，不写回静态卡牌定义。

### StorySegment

剧情段。

字段包括：

- `id`
- `title`
- `steps`
- 可选 `next`

剧情段属于内容数据，不属于组件逻辑。这样后续编辑器可以直接编辑剧情段。

### StoryStep

剧情步骤。

第一版支持以下步骤类型：

- `narration`：旁白
- `dialogue`：角色台词
- `effect`：画面或镜头效果
- `spawnCard`：生成卡牌
- `focusCard`：聚焦卡牌
- `moveCard`：移动卡牌
- `renameCard`：卡牌更名
- `setInteractable`：设置可交互卡牌
- `promptName`：取名框
- `enterStoryMode`：进入剧情界面
- `exitStoryMode`：退出剧情界面
- `goto`：跳转剧情段

### InteractionRule

卡牌交互规则。

字段包括：

- `id`
- `sourceCardId`
- `targetCardId` 或 `targetZone`
- 可选 `conditions`
- `sequence`
- `afterComplete`

`sourceCardId` 表示玩家拿起或主动使用的卡牌，`targetCardId` 表示可以被交互、高亮、投放的目标卡牌。

`sequence` 用来表达同一对卡牌第一次、第二次、剩余第 N 次交互的不同结果。画板便签中的 `1.`、`2.`、`3.......` 对应这个序列。

建议结构：

```ts
type InteractionRule = {
  id: string;
  sourceCardId: string;
  targetCardId?: string;
  targetZone?: 'fixed' | 'free';
  label?: string; // 对应画板上的 A/B/C/G 等箭头标记
  conditions?: InteractionCondition[];
  sequence: InteractionAttempt[];
  afterComplete?: InteractionAfterComplete;
};

type InteractionAttempt = {
  attempt: number | 'repeat';
  enabled: boolean;
  previewText?: string;
  results: StoryStep[];
};
```

示例：

```ts
{
  id: '1-2:protagonist-tree',
  label: 'A',
  sourceCardId: 'protagonist',
  targetCardId: 'tree',
  sequence: [
    {
      attempt: 1,
      enabled: true,
      previewText: '与众不同的树木，从未见过。',
      results: [{ type: 'narration', text: '与众不同的树木，从未见过。' }]
    },
    {
      attempt: 2,
      enabled: true,
      previewText: '这并非我的故乡。',
      results: [{ type: 'narration', text: '这并非我的故乡。' }]
    },
    {
      attempt: 'repeat',
      enabled: false,
      previewText: '没有新的反应。',
      results: []
    }
  ]
}
```

`enabled: false` 表示后续交互没有有效结果。UI 可以不给目标高亮，也可以在调试模式下显示“已无新交互”。

`results` 尽量复用 `StoryStep` 的指令语义，避免剧情指令和交互指令分裂成两套系统。

### InteractionState

运行时交互状态。

用于记录某一条交互规则已经触发过几次。

字段包括：

- `ruleId`
- `count`
- `completed`
- `lastTriggeredAt`

当玩家拿起一张卡牌时，系统根据 `sourceCardId` 查找所有规则，再结合 `InteractionState` 判断目标是否仍有可用交互。

### 拿起卡牌后的高亮规则

当玩家开始拖动或选择一张卡牌时：

1. 系统把这张卡视为 `sourceCard`。
2. 从 `InteractionRule` 中找出所有 `sourceCardId` 等于该卡牌的规则。
3. 根据 `conditions` 和 `InteractionState` 过滤当前不可用的规则。
4. 将剩余规则中的 `targetCardId` 对应卡牌设为 `highlightState = validTarget`。
5. 玩家松手时，如果落点是高亮目标，则触发对应 `InteractionRule` 的下一次 `sequence`。
6. 如果落点不是高亮目标，则卡牌回到拖拽前位置，或停留在自由区的新位置，取决于卡牌拖动策略。

高亮是由交互规则推导出来的运行时状态，不需要手写在每个卡牌实例上。

## 1-2 卡牌交互关系

`1-2` 画板中箭头表示卡牌交互关系，箭头旁的 A-G 对应便签文本。箭头起点是来源卡，箭头终点是目标卡。

| 标记 | 来源卡 | 目标卡 | 第一次交互 | 第二次交互 | 后续交互 |
| --- | --- | --- | --- | --- | --- |
| A | 主角卡 | 地点：树 | 与众不同的树木，从未见过。 | 这并非我的故乡。 | 无新交互 |
| B | 主角卡 | 物品：纹身 | 奇怪的纹身。 | 福瑞身上具有不明意义的纹身是非常合理的。 | 无新交互 |
| C | 主角卡 | 技能：双手 | 我的双手，坚实，有力，肉垫饱满。 | 何不用这双手去爬树呢？ | 无新交互 |
| D | 主角卡 | 地点：草地 | 芬芳的草地，令人安心。 | 无新交互 | 无新交互 |
| E | 技能：双手 | 地点：草地 | 我并不想吃草。 | 我还没有饿到这种程度。 | 无新交互 |
| F | 技能：双手 | 物品：纹身 | 腹部柔软的绒毛，纹身似乎仅仅是纹身。 | 无新交互 | 无新交互 |
| G | 技能：双手 | 地点：树 | 这副兽人的躯体更加灵活，洛德三两下就爬到了树梢处。 | 无新交互 | 无新交互 |

其中 G 是关键推进交互。触发后进入爬树剧情，并推进到发现黑日。

第一版实现时，玩家拿起 `主角卡` 时，应高亮 `地点：树`、`物品：纹身`、`技能：双手`、`地点：草地` 中仍有可用交互的卡牌。玩家拿起 `技能：双手` 时，应高亮 `地点：草地`、`物品：纹身`、`地点：树` 中仍有可用交互的卡牌。

### GameProgress

可序列化的运行时进度。

它需要被设计成后续编辑器或调试面板可以直接查看的结构，而不是散落在组件内部。

## UI 设计

UI 以系统案三张图作为硬约束。

### 正常探索流程界面

正常探索界面包含：

- 顶部系统固定卡牌区
- 下方其他卡牌区
- 可自由拖动的普通卡牌

系统固定卡牌区位于较底层。新出现的固定卡牌按时间顺序排列。玩家通过其他卡牌与固定区卡牌发生交互。

### 剧情界面

进入剧情模式后：

- 画面出现上下黑边。
- 可视舞台区域纵向收缩。
- NPC 对话框位于上方，头像在右侧。
- 主角对话框位于下方，头像在左侧。
- 当前没有对应台词时，隐藏对应对话框。
- 除特定卡牌外，其他卡牌淡出并不可交互。
- 保留镜头缩放、移动、聚焦能力。

CG 层级位于对话框下方。展示 CG 时，黑边按系统案要求恢复到原尺寸。

### 卡牌本体

卡牌本体渲染：

- 牌面插画
- 卡牌类型
- 卡牌名
- 持有数量
- 可选进度条

进度条只在卡牌定义中存在进度配置时显示。

### 卡牌详情

鼠标悬停一段时间或点击卡牌后，显示卡牌详情。

详情面板包含：

- 牌面插画
- 卡牌类型
- 卡牌名
- 持有数量
- 卡牌描述

详情面板根据卡牌周围空间，显示在卡牌左侧或右侧。

## 第一版可玩流程

### 1-1

从 `1-1 intro` 剧情段开始。

流程：

1. 黑屏开始，播放眨眼效果。
2. 显示主角卡。
3. 生成技能卡 `我`。
4. 进入强制教学状态。
5. 只允许把 `我` 拖到 `主角卡`。
6. 拖拽成功后播放融合效果：卡牌框碎裂，`我` 溶解到主角卡上，主角卡亮起。
7. 弹出取名框。
8. 保存玩家输入的名字。
9. 进入 `1-2`。

### 1-2

进入探索状态，生成以下卡牌：

- `树`
- `草地`
- `纹身`
- `双手`

第一版先实现关键推进交互：

- 使用 `双手` 或主角相关操作与 `树` 交互。
- 树交互触发爬树剧情。
- 生成或聚焦 `黑日`。
- 播放发现黑日的剧情。
- 继续进入哈维登场剧情。
- 生成 `???`，后续更名为 `哈维`。

第一版原型停在哈维出现并进入对话的状态。

## 素材策略

卡牌牌面美术使用图像生成，参考现有 `洛德_720.png` 的卡牌风格和大致比例。

生成图只包含牌面插画区域，不能把以下内容烘进图片：

- 卡牌名
- 卡牌类型
- 持有数量
- 进度条
- 卡牌描述
- 其他可变 UI 文本

第一版需要的牌面素材：

- 主角 / 洛德
- 技能：我
- 技能：双手
- 地点：树
- 地点：草地
- 物品：纹身
- 地点 / 提示：黑日
- 角色：哈维 / ???

## 后续编辑器要求

编辑器是已确认的后续需求。

第一版不做编辑器 UI，但实现时必须避免阻碍未来编辑器。具体要求：

- 内容存放在结构化数据文件中。
- 剧情指令和交互规则显式表达。
- 卡牌定义可复用。
- 运行状态可检查、可序列化。
- 组件逻辑中不直接写死具体剧情推进。

未来编辑器至少需要能编辑：

- 卡牌定义
- 剧情段
- 剧情步骤
- 交互规则
- 生成卡牌的位置
- 可选进度条行为

## 第一版不做的内容

第一版不包含：

- 完整 AVG 功能集
- 战斗系统
- 商店
- 成就
- 画廊
- 存档/读档 UI
- 编辑器 UI
- 所有未来卡牌的正式美术

## 验收标准

- 可以从头播放 `1-1`。
- 玩家可以把 `我` 拖到 `主角卡`。
- 融合/教学交互能推进剧情。
- 玩家可以输入名字。
- `1-1` 结束后进入 `1-2` 探索。
- 关键卡牌在正确的探索界面中生成。
- 其他卡牌区的卡牌可以拖动。
- 玩家拿起一张卡牌时，所有当前可被该卡牌交互的目标卡牌会高亮。
- 已经没有后续结果的交互不再作为有效目标高亮。
- 同一对卡牌可以根据第几次交互播放不同文本或效果。
- 树交互可以触发发现黑日的剧情。
- 哈维出现，并到达第一版计划终点。
- 剧情态、探索态、卡牌详情态符合系统案参考图的布局逻辑。
- 普通卡牌不显示进度条。
- 配置了进度行为的卡牌可以显示进度条。
- 内容数据和运行逻辑分离，足以支撑后续编辑器。

## 测试建议

手动测试路径：

- 从 `1-1` 到 `1-2` 的完整正向流程。
- 强制教学阶段尝试无效拖拽。
- 检查有进度条和无进度条卡牌的详情展示。
- 检查剧情模式下非特定卡牌是否不可交互。
- 在 `1-2` 中分别拿起 `主角卡` 和 `技能：双手`，检查可交互目标高亮是否符合 A-G 关系。
- 重复触发同一对卡牌交互，检查第一次、第二次、后续无交互状态是否正确。
- 重置后从头重新播放。

实现层测试重点：

- 剧情步骤 reducer 行为。
- 交互规则匹配。
- 根据来源卡推导可高亮目标。
- 多次交互计数与 `repeat` 处理。
- 卡牌堆叠与计数。
- 仅配置进度行为的卡牌显示进度条。
- `GameState` 的序列化结构。
