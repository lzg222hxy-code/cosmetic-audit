import { GoogleGenAI } from "@google/genai";
import { AuditContext, AuditResponse } from "../types";

// 辅助函数：清理 AI 返回可能包含的 markdown 代码块标记
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, "").trim();
};

export const auditProcess = async (
  context: AuditContext,
  apiKey: string
): Promise<AuditResponse> => {
  if (!apiKey) {
    throw new Error("系统未配置 API Key，无法启动审核服务。");
  }

  // 初始化 Google GenAI 客户端
  const clientOptions: any = { apiKey };
  if (context.settings.baseUrl) {
    clientOptions.baseUrl = context.settings.baseUrl;
  }
  
  const ai = new GoogleGenAI(clientOptions);

  // 核心 Prompt：定义 AI 的角色和审核标准
  const systemInstruction = `
你是一位拥有20年一线生产经验的资深化妆品生产工艺工程师（专注于乳化车间），同时也是一位精通中国《化妆品生产许可检查要点》(GMPC) 的合规审核专家。
你的工作是审核“半成品批生产配料单”和“生产工艺记录”。

**审核原则**：
1.  **专业严谨**：站在工艺落地和设备安全的角度，不放过任何一个可能导致质量事故的细节。
2.  **法规导向**：依据中国 GMPC 法规，杜绝文件中的不规范描述。

**核心审核任务清单**：

1.  **配料单与工艺一致性（基础红线）**：
    *   **总量平衡**：配料单中所有原料的百分比 (%) 加和必须严格等于 100%。
    *   **计算复核**：抽查 3-5 个原料，验证“配方量”是否等于“计划量 × 百分比”。
    *   **物料一致性**：工艺记录步骤中提到的投料原料名称、代码、重量，必须与配料单完全对应，严禁出现工艺中投料但配料单没写的情况。

2.  **生产工艺记录审核（乳化工艺重点）**：
    *   **严查“模糊工艺”（GMPC大忌）**：
        *   严禁使用“适量”、“少许”、“大约”、“加热至适宜温度”、“搅拌一会儿”等无法量化的词汇。一旦发现，必须标记为【Warning】并要求明确数值范围。
    *   **逻辑矛盾检查**：
        *   对比“要事摘要/注意事项”与“正文步骤”，看是否存在前后矛盾（例如摘要说先加水，步骤里却先加了油）。
    *   **关键工艺参数（CPP）**：
        *   检查乳化均质步骤是否明确了：温度（如 80-85℃）、时间（如 10min）、转速（如 3000rpm）、真空度（如 -0.05MPa）。缺失任何一项均为不合格。

3.  **设备参数安全合规（智能校验）**：
    *   **第一步：锁定设备**。在文档中寻找设备编码（如 FMA130）。
    *   **第二步：调用档案**。使用我提供的【工厂设备档案库 JSON】。
    *   **第三步：参数越限报警**。
        *   提取工艺中的设定值（如：均质转速 2800rpm）。
        *   对比设备档案中的极限值（如：FMA130 最大均质转速 1500rpm）。
        *   **判定**：若设定值 > 设备上限，这是极高风险的【Error】，必须提示“设备超限风险，可能损坏设备”！
        *   若未注明设备，则按“通用设备”标准，提示需补充设备信息。

**输出结果格式**：
请以 JSON 格式返回，包含：
- **summary**: 300字以内的专业审核结论（通过/有条件通过/不通过），并在开头明确指出最严重的问题。
- **detectedEquipment**: 识别到的设备编码。
- **complianceScore**: 0-100 打分。
- **gmpcNotes**: 引用 GMPC 条款（如文件管理制度、生产过程控制）提出的整改建议。
- **issues**: 问题列表（包含 type: error/warning/info, category, description, location）。
`;

  // 将前端传入的设备档案序列化，供 AI 参考
  const equipmentJson = JSON.stringify(context.equipmentProfiles.map(p => ({
    code: p.code,
    name: p.name,
    limits: p.parameters.map(l => ({
        name: l.name,
        min: l.min,
        max: l.max,
        unit: l.unit
    }))
  })), null, 2);

  const promptText = `
请执行审核任务。

【参考标准：工厂设备档案库】
${equipmentJson}

【待审核文件内容】
(如果此处为空，请检查文件是否上传成功)
${context.textData ? context.textData : "请分析上传的 PDF 文件内容。"}

【执行指令】
请读取上述内容（或PDF附件），逐条执行“资深工艺工程师”的审核逻辑。
重点关注：1. 配方量计算准确性；2. 工艺描述是否模糊；3. 设备参数是否超标。

请直接返回 JSON 数据，不要包含 Markdown 格式化（即不要以 \`\`\`json 开头）：
{
  "summary": "...",
  "detectedEquipment": "...",
  "complianceScore": 85,
  "gmpcNotes": "...",
  "issues": [
    {
      "type": "error",
      "category": "equipment",
      "title": "均质转速超限",
      "description": "步骤1.3设定转速2800rpm，超过FMA130设备上限1500rpm。",
      "location": "工艺步骤 1.3"
    }
  ]
}
`;

  // 构建发送给 Gemini 的数据包
  const parts: any[] = [];
  
  if (context.fileBase64) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: context.fileBase64
      }
    });
  }
  
  // 始终附带 Prompt 文本
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: context.settings.modelName || "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(cleanJsonString(text)) as AuditResponse;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMsg = "AI 审核服务暂时不可用。";
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      errorMsg = "API Key 验证失败，请检查环境变量设置。";
    } else if (error.message?.includes('429')) {
      errorMsg = "请求过于频繁，请稍后再试。";
    }
    throw new Error(errorMsg + " (详细信息: " + error.message + ")");
  }
};