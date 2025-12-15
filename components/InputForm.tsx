import React, { useCallback } from 'react';
import { UploadCloud, FileText, X, FileType } from 'lucide-react';

interface InputFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  setFileBase64: (base64: string | null) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  file,
  setFile,
  setFileBase64,
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      alert('请上传 PDF 文件');
      return;
    }
    setFile(selectedFile);
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileBase64(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        className={`flex-1 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-8 ${
          file 
            ? 'border-teal-500 bg-teal-50/30' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileType className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{file.name}</h3>
            <p className="text-sm text-slate-500 mb-6">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button 
              onClick={clearFile}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <X className="w-4 h-4" />
              移除文件
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">上传生产文件 (PDF)</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              请上传包含 <strong>“配料单”</strong> 和 <strong>“工艺记录”</strong> 的 PDF 文件。
              <br/>AI 将自动识别并交叉审核两部分内容。
            </p>
            <label className="relative cursor-pointer">
              <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all">
                选择文件
              </span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
            <p className="mt-4 text-xs text-slate-400">支持拖拽上传</p>
          </div>
        )}
      </div>
      
      {/* Information Note */}
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
        <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">文件要求提示：</p>
          <p>为了确保审核准确，PDF文件应清晰可读。如果一份PDF包含多个不同产品的记录，AI 可能会产生混淆，建议拆分为单品文件上传。</p>
        </div>
      </div>
    </div>
  );
};

export default InputForm;