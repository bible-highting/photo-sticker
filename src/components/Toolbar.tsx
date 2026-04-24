"use client";

import React, { useRef } from 'react';
import { ImagePlus, Type, MessageSquare, Download, Copy, Trash2 } from 'lucide-react';
import { StickerData, FontType } from '../types';

interface ToolbarProps {
  onAddText: () => void;
  onAddSpeechBubble: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedSticker?: StickerData;
  onUpdateSticker: (props: Partial<StickerData>) => void;
  onDeleteSticker: () => void;
  hasImage: boolean;
}

export default function Toolbar({
  onAddText,
  onAddSpeechBubble,
  onImageUpload,
  selectedSticker,
  onUpdateSticker,
  onDeleteSticker,
  hasImage
}: ToolbarProps) {


  const handleExport = () => {
    // 캔버스 내보내기는 StickerCanvas 컴포넌트 밖에서 스테이지에 접근해야하므로
    // 이 기능은 window 이벤트나 전역 상태로 구현할 수 있지만, 가장 쉬운 방법은
    // 캔버스 컴포넌트에 접근하는 법입니다. 지금은 id로 캔버스 stage를 찾도록 구성합니다.
    const stage = document.querySelector('canvas');
    if (stage) {
      const dataURL = stage.toDataURL();
      const link = document.createElement('a');
      link.download = 'photo-sticker.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopy = async () => {
    const stage = document.querySelector('canvas');
    if (stage) {
      stage.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('클립보드에 복사되었습니다.');
          } catch (err) {
            console.error(err);
            alert('클립보드 복사에 실패했습니다.');
          }
        }
      });
    }
  };

  return (
    <aside className="w-full sm:w-80 glass-panel mx-4 sm:ml-4 sm:mx-0 mb-4 mt-0 p-5 flex flex-col gap-6 overflow-y-auto z-10 shadow-sm shrink-0 sm:shrink">
      {/* 액션 그룹 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">기본 액션</h2>
        
        <label className="btn-primary w-full cursor-pointer flex items-center justify-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onImageUpload}
          />
          <ImagePlus size={18} />
          사진 불러오기
        </label>

        <button 
          className="btn-secondary w-full"
          onClick={onAddText}
          disabled={!hasImage}
          style={{ opacity: hasImage ? 1 : 0.5, cursor: hasImage ? 'pointer' : 'not-allowed' }}
        >
          <Type size={18} />
          텍스트 추가
        </button>

        <button 
          className="btn-secondary w-full"
          onClick={onAddSpeechBubble}
          disabled={!hasImage}
          style={{ opacity: hasImage ? 1 : 0.5, cursor: hasImage ? 'pointer' : 'not-allowed' }}
        >
          <MessageSquare size={18} />
          말풍선 추가
        </button>
      </div>

      {/* 선택된 스티커 편집 */}
      <div className={`flex flex-col gap-3 transition-opacity duration-300 ${selectedSticker ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <hr className="border-gray-200/50 my-2" />
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">스티커 편집</h2>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-600">내용 수정 방법</label>
          <div className="text-sm text-indigo-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
            💡 캔버스의 스티커를 <b>더블클릭(더블탭)</b> 하시면 바로 글씨를 수정할 수 있습니다.
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-600">폰트 설정</label>
          <select 
            value={selectedSticker?.fontFamily || 'NanumBarunGothic'}
            onChange={(e) => onUpdateSticker({ fontFamily: e.target.value as FontType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
          >
            <option value="NanumBarunGothic">나눔바른고딕 (기본)</option>
            <option value="Rimgul">림굴체</option>
            <option value="OmuDaye">오뮤 다예쁨체</option>
          </select>
        </div>

        {selectedSticker?.type === 'text' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600">글자 색상</label>
              <input 
                type="color" 
                value={selectedSticker.fill || '#4F46E5'}
                onChange={(e) => onUpdateSticker({ fill: e.target.value })}
                className="w-full h-8 rounded cursor-pointer border-0 p-0"
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input 
                type="checkbox" 
                id="shadow-toggle"
                checked={selectedSticker.hasShadow || false}
                onChange={(e) => onUpdateSticker({ hasShadow: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="shadow-toggle" className="text-xs font-semibold text-gray-600 cursor-pointer">
                그림자 효과 추가
              </label>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              <label className="text-xs font-semibold text-gray-600">글자 테두리 (외곽선)</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={selectedSticker.stroke || '#000000'}
                  onChange={(e) => onUpdateSticker({ stroke: e.target.value, strokeWidth: selectedSticker.strokeWidth || 2 })}
                  className="w-10 h-8 rounded cursor-pointer border-0 p-0 shrink-0"
                />
                <input 
                  type="range"
                  min="0"
                  max="10"
                  value={selectedSticker.strokeWidth || 0}
                  onChange={(e) => onUpdateSticker({ strokeWidth: parseInt(e.target.value, 10) })}
                  className="flex-1 w-full"
                />
                <span className="text-xs text-gray-500 w-4">{selectedSticker.strokeWidth || 0}</span>
              </div>
            </div>
          </>
        )}

        <button 
          className="mt-2 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
          onClick={onDeleteSticker}
        >
          <Trash2 size={16} />
          스티커 삭제
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <hr className="border-gray-200/50 mb-2" />
        <div className="flex gap-2">
          <button 
            className="btn-secondary flex-1"
            onClick={handleExport}
            disabled={!hasImage}
            title="이미지 저장"
          >
            <Download size={18} /> 저장
          </button>
          <button 
            className="btn-secondary flex-1"
            onClick={handleCopy}
            disabled={!hasImage}
            title="클립보드 복사"
          >
            <Copy size={18} /> 복사
          </button>
        </div>
      </div>
    </aside>
  );
}
