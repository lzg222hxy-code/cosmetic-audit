import React, { useState } from 'react';
import { Settings, AlertTriangle, Trash2, Plus, Server, ChevronRight } from 'lucide-react';
import { EquipmentProfile, ParameterLimit } from '../types';

interface ParameterConfigProps {
  profiles: EquipmentProfile[];
  setProfiles: (profiles: EquipmentProfile[]) => void;
}

const ParameterConfig: React.FC<ParameterConfigProps> = ({ profiles, setProfiles }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');

  const activeProfile = profiles.find(p => p.id === selectedProfileId);

  // --- Equipment Actions ---
  const handleAddEquipment = () => {
    const newId = Date.now().toString();
    const newProfile: EquipmentProfile = {
      id: newId,
      code: 'NEW-FMA',
      name: '新设备',
      parameters: []
    };
    setProfiles([...profiles, newProfile]);
    setSelectedProfileId(newId);
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('确定要删除整台设备的档案吗？此操作不可恢复。')) {
      const newProfiles = profiles.filter(p => p.id !== id);
      setProfiles(newProfiles);
      if (selectedProfileId === id && newProfiles.length > 0) {
        setSelectedProfileId(newProfiles[0].id);
      }
    }
  };

  const updateEquipmentInfo = (id: string, field: 'code' | 'name', value: string) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // --- Parameter Actions ---
  const handleAddParam = () => {
    if (!activeProfile) return;
    const newParam: ParameterLimit = {
      id: Date.now().toString(),
      name: '新部件参数',
      min: 0,
      max: 100,
      unit: 'rpm'
    };
    const updatedProfile = {
      ...activeProfile,
      parameters: [...activeProfile.parameters, newParam]
    };
    setProfiles(profiles.map(p => p.id === activeProfile.id ? updatedProfile : p));
  };

  const handleDeleteParam = (paramId: string) => {
    if (!activeProfile) return;
    if (confirm('删除此参数？')) {
        const updatedProfile = {
            ...activeProfile,
            parameters: activeProfile.parameters.filter(p => p.id !== paramId)
        };
        setProfiles(profiles.map(p => p.id === activeProfile.id ? updatedProfile : p));
    }
  };

  const updateParam = (paramId: string, field: keyof ParameterLimit, value: string | number) => {
    if (!activeProfile) return;
    const updatedParams = activeProfile.parameters.map(p => 
        p.id === paramId ? { ...p, [field]: value } : p
    );
    const updatedProfile = { ...activeProfile, parameters: updatedParams };
    setProfiles(profiles.map(p => p.id === activeProfile.id ? updatedProfile : p));
  };

  return (
    <div className="max-w-6xl mx-auto h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex">
      
      {/* Sidebar: Equipment List */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-600" />
            设备列表
          </h2>
          <p className="text-xs text-slate-500 mt-1">请选择或添加生产线设备</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {profiles.map(profile => (
                <div 
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedProfileId === profile.id 
                        ? 'bg-teal-50 border-teal-200 shadow-sm' 
                        : 'bg-white border-transparent hover:bg-slate-100'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">{profile.code}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{profile.name}</div>
                        </div>
                        {selectedProfileId === profile.id && (
                            <ChevronRight className="w-4 h-4 text-teal-500" />
                        )}
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
            <button 
                onClick={handleAddEquipment}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
            >
                <Plus className="w-4 h-4" /> 新增设备档案
            </button>
        </div>
      </div>

      {/* Main Content: Parameter Details */}
      <div className="flex-1 flex flex-col bg-white">
        {activeProfile ? (
            <>
                {/* Profile Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex-1 mr-8">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">设备编号 (Code)</label>
                        <input 
                            type="text" 
                            className="text-2xl font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-none w-full mb-2"
                            value={activeProfile.code}
                            onChange={(e) => updateEquipmentInfo(activeProfile.id, 'code', e.target.value)}
                        />
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">设备名称 / 描述</label>
                        <input 
                            type="text" 
                            className="text-sm text-slate-600 bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-none w-full"
                            value={activeProfile.name}
                            onChange={(e) => updateEquipmentInfo(activeProfile.id, 'name', e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => handleDeleteEquipment(activeProfile.id)}
                        className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除该设备"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Parameters Table */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Settings className="w-4 h-4" /> 
                            关键部件参数监控
                        </h3>
                        <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded border border-amber-100">
                            <AlertTriangle className="w-3 h-3" />
                            <span>AI 审核依据</span>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="text-slate-500 text-xs uppercase border-b border-slate-100">
                            <th className="py-2 px-2 font-medium w-1/3">参数部件名称</th>
                            <th className="py-2 px-2 font-medium w-1/6">单位</th>
                            <th className="py-2 px-2 font-medium w-1/6">Min</th>
                            <th className="py-2 px-2 font-medium w-1/6">Max</th>
                            <th className="py-2 px-2 font-medium w-10"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {activeProfile.parameters.map((param) => (
                            <tr key={param.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                                <td className="py-2 px-2">
                                    <input 
                                        type="text"
                                        className="w-full bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 p-0"
                                        value={param.name}
                                        onChange={(e) => updateParam(param.id, 'name', e.target.value)}
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <input 
                                        type="text"
                                        className="w-full bg-transparent border-none text-sm text-slate-500 focus:ring-0 p-0"
                                        value={param.unit}
                                        onChange={(e) => updateParam(param.id, 'unit', e.target.value)}
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:border-teal-500 outline-none"
                                        value={param.min}
                                        onChange={(e) => updateParam(param.id, 'min', Number(e.target.value))}
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:border-teal-500 outline-none"
                                        value={param.max}
                                        onChange={(e) => updateParam(param.id, 'max', Number(e.target.value))}
                                    />
                                </td>
                                <td className="py-2 px-2 text-center">
                                    <button 
                                        onClick={() => handleDeleteParam(param.id)}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <button 
                        onClick={handleAddParam}
                        className="mt-4 text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
                    >
                        <Plus className="w-3 h-3" /> 添加新参数
                    </button>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Server className="w-12 h-12 mb-4 opacity-50" />
                <p>请在左侧选择或添加一个设备档案</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ParameterConfig;