import { EquipmentProfile } from './types';

const COMMON_PARAMS = [
  { id: '1', name: '主锅加热温度', min: 0, max: 95, unit: '℃' },
  { id: '4', name: '主锅真空度', min: -0.09, max: 0, unit: 'MPa' },
  { id: '5', name: '冷却出料温度', min: 35, max: 45, unit: '℃' },
];

export const DEFAULT_EQUIPMENT_PROFILES: EquipmentProfile[] = [
  {
    id: '1',
    code: 'FMA010',
    name: '100L 真空均质乳化机',
    parameters: [
      ...COMMON_PARAMS,
      { id: '2', name: '主锅均质转速', min: 0, max: 3600, unit: 'rpm' }, // 小锅转速高
      { id: '3', name: '主锅外框搅拌', min: 0, max: 60, unit: 'rpm' },
    ]
  },
  {
    id: '2',
    code: 'FMA050',
    name: '500L 真空均质乳化机',
    parameters: [
      ...COMMON_PARAMS,
      { id: '2', name: '主锅均质转速', min: 0, max: 3000, unit: 'rpm' }, // 中锅转速稍低
      { id: '3', name: '主锅外框搅拌', min: 0, max: 50, unit: 'rpm' },
    ]
  },
  {
    id: '3',
    code: 'FMA130',
    name: '1000L/1T 大型乳化机组',
    parameters: [
      ...COMMON_PARAMS,
      { id: '2', name: '主锅均质转速', min: 0, max: 1500, unit: 'rpm' }, // 大锅转速低
      { id: '3', name: '主锅外框搅拌', min: 0, max: 40, unit: 'rpm' },
      { id: '6', name: '油相锅搅拌', min: 0, max: 960, unit: 'rpm' },
    ]
  }
];

export const SAMPLE_FORMULA_TEXT = `半成品批生产配料单 TT003 B.2
产品名称 樊文花山茶花倍润护手霜 配方号 202067 计划量 3000kg 版本 V1.1
No 组相 原料代码 % 配方量 单位
1 A YZ001 1 30.00 kg
2 A YZ015 2 60.00 kg
3 A YZ016 3 90.00 kg
4 A YZ046 0.11 3.30 kg
5 A YZ080 0.3 9.00 kg
6 A A165 3 90.00 kg
7 A YZ002 2 60.00 kg
8 A C16/18OH 1 30.00 kg
9 A DC-200(350) 1 30.00 kg
10 A Y007 0.05 1.50 kg
11 B 水 77.2 2316.00 kg
12 B BS012 1.5 45.00 kg
13 B F008 0.05 1.50 kg
14 B ZC016 0.15 4.50 kg
15 B AM20 3 90.00 kg
16 C BS014 1.5 45.00 kg
17 C A076 0.5 15.00 kg
18 C 水 0.655 19.65 kg
19 C F060 0.1 3.00 kg
20 D J005 0.5 15.00 kg
21 D BS083 1 30.00 kg
22 D JY038 0.3 9.00 kg
23 D BS143 0.05 1.50 kg
24 D JY036 0.013 390.00 g
25 D 水 0.02 600.00 g
26 D BS241 0.001 30.00 g
27 D BS183 0.001 30.00 g
合计 —— 100 3000.00 kg
要事摘录:
ZC016作为粘度调节剂，添加范围是0.05%-0.25%；
F060作为pH调节剂，添加范围是0.05%-0.25%。`;

// Added Equipment Code to sample text for testing
export const SAMPLE_PROCESS_TEXT = `樊文花山茶花倍润护手霜-生产工艺记录
生产设备编码: FMA130 (1T乳化机)
注意事项:
1、水油锅要进行抽料操作时，应确保水油锅内料体溶解完全，并且关闭搅拌桨，再进行操作；
2、在投料/操作时，应严格按照此工艺记录进行操作并做好实时记录；

工艺步骤:
1. 称量出B组相用水至主锅中，再将B组相部分成分加入主锅，加热至83±2℃，加入剩余B相，分散完全。
1.2 点击【加管道物料】先在主锅加入部分纯水，加入BS012 (水 900kg, BS012 45kg)
1.3 开启【物料循环】均质速度 2800rpm, 时间 2min (注意：此处设定2800，而FMA130上限是1500，应报错)
1.4 均质下依次加入剩余部分A相原料 (F008 1.5kg, ZC016 4.5kg)
1.5 密封锅盖，开启搅拌，外框搅拌 20rpm, 内框搅拌 40rpm
1.6 开启【物料循环】，均质 1400rpm, 2min
1.7 开启【温度控制】，加热升温，设定 83℃
1.8 开启主锅【压力控制】，真空 -0.03~-0.06 MPa
1.13 打开锅盖，加入 AM20 90.00kg
1.14 加入剩余热纯水 1375.00kg

2. 将A组相原料加入油锅，加热至83±2℃。
2.1 将部分A组相原料加入油锅
2.2 打开油锅【分散】，搅拌速度 500rpm
2.3 开启【温度控制】，加热升温 83±2℃

3. 将油相料体抽入主锅，进行均质乳化。
3.1 检查主锅/油相温度是否在83±2℃
3.4 开启主锅【压力控制】真空 -0.03~-0.05MPa
调节主锅搅拌：外框 42rpm (FMA130上限40，应报警), 内框 40rpm`;