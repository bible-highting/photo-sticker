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
    <>
      {/* 우측 상하단 떠있는 기본 조작 도구 (릴스 스타일) */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-5 z-20 pointer-events-auto">
        <label 
          className="w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md cursor-pointer transition-all border border-white/20 text-white shadow-lg flex items-center justify-center group relative"
          title="사진 불러오기"
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onImageUpload}
          />
          <ImagePlus size={22} />
        </label>

        {hasImage && (
          <>
            <button 
              className="w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md cursor-pointer transition-all border border-white/20 text-white shadow-lg flex items-center justify-center group"
              onClick={onAddText}
              title="텍스트 추가"
            >
              <Type size={22} />
            </button>

            <button 
              className="w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md cursor-pointer transition-all border border-white/20 text-white shadow-lg flex items-center justify-center group"
              onClick={onAddSpeechBubble}
              title="말풍선 추가"
            >
              <MessageSquare size={22} />
            </button>

            <div className="w-8 h-[1px] bg-white/20 mx-auto my-1"></div>

            <button 
              className="w-12 h-12 bg-indigo-500/80 hover:bg-indigo-600 rounded-full backdrop-blur-md cursor-pointer transition-all border border-indigo-400/50 text-white shadow-lg flex items-center justify-center group"
              onClick={handleExport}
              title="저장"
            >
              <Download size={22} />
            </button>

            <button 
              className="w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md cursor-pointer transition-all border border-white/20 text-white shadow-lg flex items-center justify-center group"
              onClick={handleCopy}
              title="복사"
            >
              <Copy size={22} />
            </button>
          </>
        )}
      </div>

      {/* 스티커 선택 시 하단에 뜨는 에디팅 바 */}
      <div 
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/60 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 z-20 pointer-events-auto transition-all duration-300 transform ${selectedSticker ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
        <div className="flex justify-between items-center px-1">
          <select 
            value={selectedSticker?.fontFamily || 'NanumBarunGothic'}
            onChange={(e) => onUpdateSticker({ fontFamily: e.target.value as FontType })}
            className="bg-transparent border border-white/30 text-white text-sm rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/50"
          >
            <option value="NanumBarunGothic" className="text-black">나눔바른고딕</option>
            <option value="Rimgul" className="text-black">림굴체</option>
            <option value="OmuDaye" className="text-black">오뮤다예쁨체</option>
          </select>

          <button 
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full hover:bg-red-500/10 transition-colors text-sm font-medium"
            onClick={onDeleteSticker}
          >
            <Trash2 size={16} />
            지우기
          </button>
        </div>

        {selectedSticker?.type === 'text' && (
          <div className="flex items-center justify-between gap-4 px-1 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 font-medium">색상</span>
              <input 
                type="color" 
                value={selectedSticker.fill || '#ffffff'}
                onChange={(e) => onUpdateSticker({ fill: e.target.value })}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full overflow-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 font-medium">테두리</span>
              <input 
                type="color" 
                value={selectedSticker.stroke || '#000000'}
                onChange={(e) => onUpdateSticker({ stroke: e.target.value, strokeWidth: selectedSticker.strokeWidth || 3 })}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full overflow-hidden"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <input 
                type="checkbox" 
                id="shadow-toggle"
                checked={selectedSticker.hasShadow || false}
                onChange={(e) => onUpdateSticker({ hasShadow: e.target.checked })}
                className="w-4 h-4 rounded focus:ring-offset-0 bg-transparent"
              />
              <label htmlFor="shadow-toggle" className="text-xs text-white/70 font-medium cursor-pointer">
                그림자
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
