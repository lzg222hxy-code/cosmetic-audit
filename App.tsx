import React, { useState, useEffect } from 'react';
import { Beaker, Settings as SettingsIcon, PlayCircle, RotateCcw, UploadCloud, Globe, Server, Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import InputForm from './components/InputForm';
import ParameterConfig from './components/ParameterConfig';
import ReportView from './components/ReportView';
import { AppView, AuditResponse, EquipmentProfile, AppSettings } from './types';
import { DEFAULT_EQUIPMENT_PROFILES, SAMPLE_FORMULA_TEXT, SAMPLE_PROCESS_TEXT } from './constants';
import { auditProcess } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INPUT);
  
  // File State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  
  // Demo text fallback (internal use)
  const [demoText, setDemoText] = useState<string | null>(null);

  // Equipment Profiles with LocalStorage Persistence
  const [profiles, setProfiles] = useState<EquipmentProfile[]>(() => {
    // Try to load from local storage on initialization
    const saved = localStorage.getItem('cpa_equipment_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load profiles", e);
        return DEFAULT_EQUIPMENT_PROFILES;
      }
    }
    return DEFAULT_EQUIPMENT_PROFILES;
  });

  // Save profiles whenever they change
  useEffect(() => {
    localStorage.setItem('cpa_equipment_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    baseUrl: '',
    modelName: 'gemini-2.5-flash'
  });

  const hasApiKey = !!process.env.API_KEY;

  const handleAudit = async () => {
    if (!pdfBase64 && !demoText) {
      alert("请先上传PDF文件或加载范本数据");
      return;
    }

    if (!hasApiKey) {
        alert("系统未检测到 API Key，无法启动 AI 审核。请在 GitHub Secrets 中配置 API_KEY。");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const auditResult = await auditProcess({
        fileBase64: pdfBase64,
        textData: demoText,
        equipmentProfiles: profiles,
        settings
      }, process.env.API_KEY as string);
      
      setResult(auditResult);
      setView(AppView.REPORT);
    } catch (e: any) {
      setError(e.message || "审核过程中发生错误");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const combined = `【DEMO 文本模式 - 模拟PDF内容】\n\n${SAMPLE_FORMULA_TEXT}\n\n${SAMPLE_PROCESS_TEXT}`;
    setDemoText(combined);
    setPdfFile(null);
    setPdfBase64(null);
    setView(AppView.INPUT);
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfBase64(null);
    setDemoText(null);
    setResult(null);
    setView(AppView.INPUT);
  };

  const restoreDefaults = () => {
    if(confirm("确定要恢复默认设备参数吗？您自定义的设备数据将丢失。")) {
      setProfiles(DEFAULT_EQUIPMENT_PROFILES);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <SettingsIcon className="w-5 h-5 text-slate-600" /> 系统设置
                </h3>
                <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">关闭</button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">模型选择 (Model)</label>
                   <select 
                      value={settings.modelName}
                      onChange={(e) => setSettings({...settings, modelName: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                   >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (推荐/PDF分析强)</option>
                      <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                   </select>
                   <p className="text-xs text-slate-500 mt-1">如需使用国内模型，请确保 Base URL 支持该模型格式。</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">API Base URL (代理地址)</label>
                   <div className="relative">
                      <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                          type="text" 
                          placeholder="例如: https://your-proxy-domain.com"
                          value={settings.baseUrl}
                          onChange={(e) => setSettings({...settings, baseUrl: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                   </div>
                   <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      国内访问必须配置此项 (如使用转发服务)
                   </p>
                </div>
             </div>

             <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
                >
                  保存设置
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-800">CPA 系统 <span className="text-teal-600 text-xs ml-1 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">乳化车间 (已加载 GMPC 范本)</span></h1>
              <p className="text-[10px] font-medium text-slate-400 tracking-wider">COSMETIC PROCESS AUDITOR</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-slate-100 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setView(AppView.INPUT)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === AppView.INPUT ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                1. 文件上传
              </button>
              <button 
                onClick={() => setView(AppView.SETTINGS)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === AppView.SETTINGS ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                2. 设备参数配置
              </button>
              <button 
                disabled={!result}
                onClick={() => setView(AppView.REPORT)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === AppView.REPORT ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}
              >
                3. 审核报告
              </button>
            </div>
            
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="设置 / 模型切换"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {!hasApiKey && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-4 rounded-lg flex items-start gap-3 shadow-sm no-print">
             <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
             <div>
                <span className="font-bold block mb-1">系统正在初始化...</span> 
                <p className="text-sm opacity-90 leading-relaxed">
                   如果您已配置 API Key，请等待 GitHub Actions 部署完成（约1-2分钟）。<br/>
                   部署完成后，刷新此页面，下方指示灯将变绿。
                </p>
             </div>
          </div>
        )}

        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 no-print">
                <span className="font-bold">Error:</span> {error}
            </div>
        )}

        {view === AppView.INPUT && (
          <div className="space-y-6 h-[calc(100vh-180px)] flex flex-col">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">工艺文件上传</h2>
                    <p className="text-sm text-slate-500">上传包含【配料单】与【工艺记录】的完整PDF文件</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={loadSampleData}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <UploadCloud className="w-4 h-4" />
                        加载演示范本 (Text)
                    </button>
                    <button 
                        onClick={resetAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        重置
                    </button>
                </div>
            </div>
            
            {demoText && !pdfFile && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-2">
                    当前处于演示模式（使用预置文本）。如需测试真实文件，请点击“重置”后上传PDF。
                </div>
            )}

            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {demoText ? (
                    <div className="h-full flex flex-col">
                         <h3 className="font-mono text-xs text-slate-400 mb-2 uppercase tracking-widest">Demo Content Preview</h3>
                         <textarea 
                            readOnly 
                            className="flex-1 w-full bg-slate-50 p-4 rounded-lg font-mono text-sm text-slate-600 resize-none outline-none border border-slate-200"
                            value={demoText}
                         />
                    </div>
                ) : (
                    <InputForm 
                        file={pdfFile}
                        setFile={setPdfFile}
                        setFileBase64={setPdfBase64}
                    />
                )}
            </div>
          </div>
        )}

        {view === AppView.SETTINGS && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">设备与参数档案管理</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Save className="w-3 h-3 text-teal-600" />
                            修改后将自动保存到本机
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={restoreDefaults} className="text-sm text-slate-400 hover:text-red-500 underline">
                            恢复默认数据
                        </button>
                        <button onClick={() => setView(AppView.INPUT)} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                            完成配置
                        </button>
                    </div>
                 </div>
                 <ParameterConfig profiles={profiles} setProfiles={setProfiles} />
             </div>
        )}

        {view === AppView.REPORT && result && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold text-slate-800">AI 审核报告</h2>
                     <button onClick={() => setView(AppView.INPUT)} className="text-sm text-slate-500 hover:text-teal-600">
                        返回文件上传
                    </button>
                 </div>
                 <ReportView data={result} />
             </div>
        )}
      </main>

      {/* Sticky Footer for Actions */}
      <footer className="bg-white border-t border-slate-200 py-4 sticky bottom-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${hasApiKey ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-bold ${hasApiKey ? 'text-green-700' : 'text-red-700'}`}>
                        {hasApiKey ? 'System Online (Key Verified)' : 'Key Missing'}
                    </span>
                </div>
                <div className="hidden md:block text-slate-400">
                   GMPC RuleSet: <span className="text-green-600">v2.4 (App v1.1.3)</span>
                </div>
            </div>
            
            <div className="flex gap-4">
                {view === AppView.INPUT && (
                    <button 
                        onClick={() => setView(AppView.SETTINGS)}
                        className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-transparent"
                    >
                        下一步: 配置设备参数
                    </button>
                )}
                
                <button
                    disabled={loading || !hasApiKey}
                    onClick={handleAudit}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-lg shadow-md transition-all ${
                        loading ? 'bg-slate-100 text-slate-400 cursor-wait' : 
                        hasApiKey ? 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg hover:shadow-teal-200/50' : 
                        'bg-slate-300 text-white cursor-not-allowed'
                    }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            AI 深度审核中...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="w-5 h-5" />
                            {view === AppView.REPORT ? '重新审核' : '开始智能审核'}
                        </>
                    )}
                </button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
