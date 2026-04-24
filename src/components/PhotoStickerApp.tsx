"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from './Toolbar';
import { StickerData, FontType } from '../types';

// react-konva 컴포넌트들을 CSR 전용으로 불러옵니다. (Next.js SSR 에러 방지)
const StickerCanvas = dynamic(() => import('./StickerCanvas'), {
  ssr: false,
});

export default function PhotoStickerApp() {
  const [bgImageSrc, setBgImageSrc] = useState<string | null>(null);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [copiedSticker, setCopiedSticker] = useState<StickerData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 키보드로 스티커 액션 처리 (삭제, 복사, 붙여넣기)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 텍스트를 입력 중(input, textarea)일 때는 작동하지 않도록 예외 처리
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // 복사 (Ctrl+C / Cmd+C)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        if (selectedStickerId) {
          const stickerToCopy = stickers.find(s => s.id === selectedStickerId);
          if (stickerToCopy) setCopiedSticker(stickerToCopy);
        }
      }

      // 붙여넣기 (Ctrl+V / Cmd+V)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        if (copiedSticker) {
          const newSticker: StickerData = {
            ...copiedSticker,
            id: Date.now().toString(),
            x: copiedSticker.x + 20,
            y: copiedSticker.y + 20,
          };
          setStickers((prev) => [...prev, newSticker]);
          setSelectedStickerId(newSticker.id);
          // 연속 붙여넣기 시 계단식으로 생성되도록 참조 갱신
          setCopiedSticker(newSticker);
        }
      }

      // 삭제 (Delete / Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStickerId) {
        setStickers((prev) => prev.filter((st) => st.id !== selectedStickerId));
        setSelectedStickerId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStickerId, stickers, copiedSticker]);

  // 새로운 스티커 추가
  const addSticker = (type: 'text' | 'speech_bubble') => {
    const newSticker: StickerData = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      text: type === 'speech_bubble' ? '말풍선입니다' : '텍스트를 입력하세요',
      fontFamily: 'NanumBarunGothic',
      fontSize: 32,
      fill: type === 'speech_bubble' ? '#000000' : '#4F46E5',
      hasShadow: false,
      stroke: '',
      strokeWidth: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    
    // HEIC 파일은 브라우저 캔버스/img 태그에서 네이티브하게 렌더링되지 않아 빈 화면이 될 수 있습니다.
    if (/\.(heic)$/i.test(file.name) || file.type === 'image/heic') {
      alert('아이폰 HEIC 이미지는 지원되지 않습니다. JPG 또는 PNG 형태로 변환하거나 캡처 후 업로드해주세요!');
      return;
    }

    const isLikelyImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);
    
    if (!isLikelyImage && file.type !== "") {
      alert(`이미지 파일만 업로드 가능합니다. (현재 타입: ${file.type || '알 수 없음'})`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBgImageSrc(reader.result as string);
      // 이미지가 새로 로드되면 스티커 목록 초기화 (선택사항이나, 테스트가 편합니다.)
      setStickers([]);
      setSelectedStickerId(null);
    };
    reader.readAsDataURL(file);
  };

  // 배경 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // 스티커 속성 업데이트
  const updateSticker = (id: string, updatedProps: Partial<StickerData>) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, ...updatedProps } : sticker
      )
    );
  };

  const deleteSticker = (id: string) => {
    setStickers((prev) => prev.filter((st) => st.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // 선택 해제 핸들러 (빈 캔버스 클릭 시)
  const deselectSticker = () => {
    setSelectedStickerId(null);
  };

  const selectedSticker = stickers.find(s => s.id === selectedStickerId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-white relative">
      {/* 캔버스 래퍼 영역 (전체 화면 릴스 스타일) */}
      <main 
        className={`flex-1 w-full h-full flex flex-col items-center justify-center relative transition-colors duration-300 ${isDragging ? 'bg-indigo-500/20' : 'bg-neutral-950'}`} 
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!bgImageSrc && (
          <div className="absolute top-8 left-6 opacity-30 select-none pointer-events-none z-0">
            <h1 className="text-xl font-bold tracking-wider text-white">
             Photo Sticker Web
            </h1>
          </div>
        )}

        {bgImageSrc ? (
          <div className="w-full h-full flex items-center justify-center relative p-0 sm:p-4">
            <div className="w-full h-full relative" style={{ maxWidth: '1200px' }}>
              <StickerCanvas 
                bgImageSrc={bgImageSrc}
                stickers={stickers}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onChangeSticker={updateSticker}
                onDeselect={deselectSticker}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white/50 gap-6 w-full h-full pointer-events-none relative z-10">
            <div className={`p-8 rounded-full bg-white/5 backdrop-blur-md transition-all ${isDragging ? 'scale-110 bg-indigo-500/30 text-indigo-300' : ''}`}>
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium">
              {isDragging ? '여기에 사진을 놓아주세요!' : '사진을 드래그하거나 우측 아이콘으로 불러오세요'}
            </p>
          </div>
        )}

        {/* 릴스 스타일 플로팅 오버레이 툴바 */}
        <Toolbar 
          onAddText={() => addSticker('text')}
          onAddSpeechBubble={() => addSticker('speech_bubble')}
          onImageUpload={handleImageUpload}
          selectedSticker={selectedSticker}
          onUpdateSticker={(props) => selectedStickerId && updateSticker(selectedStickerId, props)}
          onDeleteSticker={() => selectedStickerId && deleteSticker(selectedStickerId)}
          hasImage={!!bgImageSrc}
        />
      </main>
    </div>
  );
}
