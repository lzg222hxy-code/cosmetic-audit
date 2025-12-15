import { EquipmentProfile } from './types';

const COMMON_PARAMS = [
  { id: '1', name: '主锅加热温度', min: 0, max: 95, unit: '℃' },
  { id: '4', name: '主锅真空度', min: -0.09, max: 0, unit: 'MPa' },
  { id: '5', name: '冷却出料温度', min: 35, max: 45, unit: '℃' },
];

// 预设的乳化设备参数库
export const DEFAULT_EQUIPMENT_PROFILES: EquipmentProfile[] = [
  {
    id: '1',
    code: 'FMA010',
    name: '100L 真空均质乳化机',
    parameters: [
      ...COMMON_PARAMS,
      { id: '2', name: '主锅均质转速', min: 0, max: 3600, unit: 'rpm' },
      { id: '3', name: '主锅外框搅拌', min: 0, max: 60, unit: 'rpm' },
    ]
  },
  {
    id: '2',
    code: 'FMA050',
    name: '500L 真空均质乳化机',
    parameters: [
      ...COMMON_PARAMS,
      { id: '2', name: '主锅均质转速', min: 0, max: 3000, unit: 'rpm' },
      { id: '3', name: '主锅外框搅拌', min: 0, max: 50, unit: 'rpm' },
    ]
  },
  {
    id: '3',
    code: 'FMA130',
    name: '1000L/1T 大型乳化机组',
    parameters: [
      ...COMMON_PARAMS,
      { id: '2', name: '主锅均质转速', min: 0, max: 1500, unit: 'rpm' }, // 注意：这个设备的转速上限较低
      { id: '3', name: '主锅外框搅拌', min: 0, max: 40, unit: 'rpm' },
      { id: '6', name: '油相锅搅拌', min: 0, max: 960, unit: 'rpm' },
    ]
  }
];

// 演示用的配方文本（包含故意设置的错误）
export const SAMPLE_FORMULA_TEXT = `半成品批生产配料单
产品名称: 山茶花倍润护手霜
配方号: 202067   计划量: 3000kg   版本: V1.1

No  组相  原料代码  名称       %       配方量(kg)
1   A     YZ001    油脂A      30.00   900.00
2   A     YZ015    乳化剂     2.00    60.00
3   B     WATER    去离子水    65.00   1950.00
4   B     GLY      甘油       2.00    60.00
5   C     EXT      提取物     0.50    15.00
6   C     F060     PH调节剂   0.10    3.00
7   D     PRE      防腐剂     0.40    13.00 (错误：正确计算应为 12.00kg)
合计                        100.00   3000.00

【要事摘要 / 注意事项】
1. ZC016作为粘度调节剂，添加范围是0.05%-0.25%。
2. 关键点：香精和提取物必须在温度降至 45℃ 以下后加入，防止活性成分失活。
3. 乳化均质时间严格控制在 5分钟以内。`;

// 演示用的工艺文本（包含故意设置的 GMPC 不合规项）
export const SAMPLE_PROCESS_TEXT = `生产工艺记录
生产设备编码: FMA130 (1T乳化机)

一、准备工作
检查设备清洁度，确认无残留。

二、工艺步骤
1. B相制备：
   1.1 将 B组相原料（水、甘油）加入水锅。
   1.2 开启加热，升温至 85℃，搅拌适量时间。(GMPC不合规：描述模糊)

2. A相制备：
   2.1 将 A组相原料加入油锅。
   2.2 加热溶解，温度控制 85℃。

3. 乳化均质：
   3.1 将油相抽入主锅（主锅内已有水相）。
   3.2 开启【均质】，设定转速 2000rpm。(设备超限：FMA130上限是1500rpm)
   3.3 均质时间 3分钟。

4. 降温与加料：
   4.1 开启循环水降温。
   4.2 当温度降至 55℃ 时，加入 C相提取物 和 D相防腐剂。(逻辑矛盾：配料单摘要要求45度以下)。
   4.3 继续搅拌降温至出料温度。

5. 出料：
   检测理化指标，合格后出料。`;
