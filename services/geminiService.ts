import { GoogleGenAI } from "@google/genai";
import { AuditContext, AuditResponse } from "../types";

// 辅助函数：清理 AI 返回的 JSON 字符串（去除 Markdown 标记）
const cleanJsonString = (str: string): string => {
  const jsonBlockMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) return jsonBlockMatch[1].trim();

  const firstOpen = str.indexOf('{');
  const lastClose = str.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return str.substring(firstOpen, lastClose + 1);
  }

  return str.replace(/```json\n?|\n?```/g, "").trim();
};

export const auditProcess = async (
  context: AuditContext,
  apiKey: string
): Promise<AuditResponse> => {
  if (!apiKey) {
    throw new Error("系统未配置 API Key，无法启动审核服务。");
  }

  const clientOptions: any = { apiKey };
  if (context.settings.baseUrl) {
    clientOptions.baseUrl = context.settings.baseUrl;
  }
  
  const ai = new GoogleGenAI(clientOptions);

  // 1. 构建设备参数上下文，供 AI 比对使用
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

  // 2. 核心 Prompt：GMPC 乳化工艺审核指令
  const systemInstruction = `
你现在的身份是：**资深化妆品工艺工程师（乳化/制造方向）**，同时也是精通**中国《化妆品生产质量管理规范》(GMPC)** 的合规审核专家。
你的任务是审核“半成品批生产配料单”和“生产工艺记录”。

请严格按照以下**四大核心维度**进行逻辑校验，任何不满足要求的地方都要作为【Issue】指出：

### 第一维度：半成品批生产配料单审核
1.  **总量核查**：
    *   计算所有原料的百分比 (%) 加总。
    *   *判定*：必须严格等于 **100%**。如果不等于，标记为 **ERROR** (标题: 配方总量异常)。
2.  **量值复核**：
    *   计算公式：理论配方量 = 计划量 × (百分比 / 100)。
    *   *判定*：将计算结果与单据上的“配方量”对比。允许 ±0.01kg 的误差。超出误差标记为 **ERROR** (标题: 计划量计算错误)。
3.  **要事摘要/注意事项一致性**：
    *   提取单据中的“要事摘要”或“注意事项”（如：PH值要求、特定原料加入温度、均质时间限制）。
    *   *判定*：检查这些要求是否与下文的“生产工艺记录”存在矛盾。如有矛盾，标记为 **ERROR** (标题: 摘要与工艺矛盾)。

### 第二维度：生产工艺记录审核（乳化重点）
1.  **工艺描述清晰度 (GMPC 重点)**：
    *   *规则*：GMPC 规定工艺参数必须量化，严禁模棱两可。
    *   *判定*：查找诸如“加入适量”、“搅拌少许时间”、“加热至溶解”、“适度均质”、“冷却至适当温度”等词汇。
    *   *结果*：发现此类词汇标记为 **WARNING** (标题: 工艺描述模糊/不合规)。
2.  **原料一致性 (物料平衡)**：
    *   *判定*：工艺步骤中提及的原料名称、代码、重量，必须与配料单完全一致。
    *   *结果*：如果工艺中出现了配料单没有的原料，或重量不符，标记为 **ERROR** (标题: 原料不一致)。
3.  **乳化工艺逻辑**：
    *   检查油相和水相混合时的温差（通常应控制在 5℃ 以内）。
    *   检查热敏性原料（如提取物、香精）的加入温度（通常需 < 45℃）。

### 第三维度：设备参数智能校验 (核心功能)
我将提供【工厂设备档案库】，包含参数的上下限（Min/Max）。
1.  **识别设备**：尝试从文档中识别当前使用的设备编码（如 FMAxxxx）。
2.  **参数比对**：提取工艺文本中设定的参数值（温度、转速、时间、真空度）。
3.  **越限判定**：
    *   如果 设定值 < Min 或 设定值 > Max。
    *   *结果*：标记为 **ERROR** (标题: 设备参数超限)。
    *   *描述*：明确指出设定值是多少，设备极限是多少。

### 第四维度：合规性输出
*   针对发现的问题，请引用 GMPC 法规条款或工艺工程学的专业术语进行解释。
*   如果文件完美无缺，请给予高度评价。

---
**输出格式要求**：
请仅返回 JSON 格式，不要包含 Markdown 格式标记（如 \`\`\`json），结构如下：
{
  "summary": "简短的审核总结，使用专业工程师口吻。",
  "detectedEquipment": "识别到的设备编码（若无则null）",
  "complianceScore": 0-100 (整数，起步100，每个Error扣15，每个Warning扣5),
  "gmpcNotes": "GMPC合规建议及引用",
  "issues": [
    {
      "type": "error" | "warning" | "info",
      "category": "formula" | "process" | "consistency" | "equipment",
      "title": "问题简述",
      "description": "详细描述，包含具体数据对比。",
      "location": "问题所在的步骤或段落"
    }
  ]
}
`;

  const promptText = `
【工厂设备档案库 (参数上下限)】
${equipmentJson}

【待审核文件内容】
${context.textData ? context.textData : "请分析上传的 PDF 文件内容。"}
`;

  const parts: any[] = [];
  
  if (context.fileBase64) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: context.fileBase64
      }
    });
  }
  
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
    
    try {
      return JSON.parse(cleanJsonString(text)) as AuditResponse;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("AI 返回的数据格式无法解析，建议重试。");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMsg = "AI 审核服务暂时不可用。";
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      errorMsg = "API Key 验证失败，请检查配置。";
    } else if (error.message?.includes('429')) {
      errorMsg = "请求过于频繁，请稍后再试。";
    }
    throw new Error(errorMsg + " (详细信息: " + error.message + ")");
  }
