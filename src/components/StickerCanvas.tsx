"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Label, Tag, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import { StickerData } from '../types';

interface StickerCanvasProps {
  bgImageSrc: string;
  stickers: StickerData[];
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onChangeSticker: (id: string, newAttrs: Partial<StickerData>) => void;
  onDeselect: () => void;
}

export default function StickerCanvas({
  bgImageSrc,
  stickers,
  selectedStickerId,
  onSelectSticker,
  onChangeSticker,
  onDeselect
}: StickerCanvasProps) {
  // 배경 이미지 로드
  const [image, status] = useImage(bgImageSrc);
  
  // 캔버스 사이즈 결정
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [imageScale, setImageScale] = useState(1);

  // 컨테이너 크기에 맞춰 스테이지 및 이미지 리사이징
  useEffect(() => {
    if (!image || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: containerWidth, height: containerHeight } = entry.contentRect;
        if (containerWidth === 0 || containerHeight === 0) continue;

        const imgRatio = image.width / image.height;
        const containerRatio = containerWidth / containerHeight;
        
        let newWidth, newHeight, scale;
        
        if (containerRatio > imgRatio) {
          newHeight = containerHeight;
          newWidth = containerHeight * imgRatio;
          scale = containerHeight / image.height;
        } else {
          newWidth = containerWidth;
          newHeight = containerWidth / imgRatio;
          scale = containerWidth / image.width;
        }

        setStageSize({ width: newWidth, height: newHeight });
        setImageScale(scale);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [image]);

  const checkDeselect = (e: any) => {
    // Stage의 빈 공간이나 Background 이미지를 클릭하면 선택 해제
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'backgroundImage';
    if (clickedOnEmpty) {
      onDeselect();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative max-h-[80vh] max-w-[70vw]">
      {status === 'loading' && <div className="absolute font-bold text-gray-500">Loading Image...</div>}
      {image && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {/* Background Image */}
            <KonvaImage
              name="backgroundImage"
              image={image}
              width={stageSize.width}
              height={stageSize.height}
            />

            {/* Stickers Layer */}
            {stickers.map((sticker) => (
              <StickerNode 
                key={sticker.id}
                sticker={sticker}
                isSelected={sticker.id === selectedStickerId}
                onSelect={() => onSelectSticker(sticker.id)}
                onChange={(newAttrs) => onChangeSticker(sticker.id, newAttrs)}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}

// 개별 스티커 노드 (Text or Speech Bubble)
interface StickerNodeProps {
  sticker: StickerData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<StickerData>) => void;
}

const StickerNode = ({ sticker, isSelected, onSelect, onChange }: StickerNodeProps) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // 선택된 경우 Transformer 대상 지정
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (e: any) => {
    const node = shapeRef.current;
    if (!node) return;
    
    onChange({
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    });
  };

  return (
    <>
      {sticker.type === 'text' ? (
        <Text
          ref={shapeRef}
          x={sticker.x}
          y={sticker.y}
          text={sticker.text}
          fontFamily={sticker.fontFamily}
          fontSize={sticker.fontSize}
          fill={sticker.fill}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          scaleX={sticker.scaleX || 1}
          scaleY={sticker.scaleY || 1}
          rotation={sticker.rotation || 0}
          shadowColor={sticker.hasShadow ? "rgba(0,0,0,0.5)" : undefined}
          shadowBlur={sticker.hasShadow ? 5 : 0}
          shadowOffset={sticker.hasShadow ? { x: 2, y: 2 } : { x: 0, y: 0 }}
          stroke={sticker.stroke || undefined}
          strokeWidth={sticker.strokeWidth || 0}
          padding={5}
        />
      ) : (
        <Group
          ref={shapeRef}
          x={sticker.x}
          y={sticker.y}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          scaleX={sticker.scaleX || 1}
          scaleY={sticker.scaleY || 1}
          rotation={sticker.rotation || 0}
        >
          {/* Label automatically wraps text and provides a Tag background */}
          <Label>
            <Tag 
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={3}
              pointerDirection="down"
              pointerWidth={20}
              pointerHeight={20}
              lineJoin="round"
              cornerRadius={15}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.2}
              shadowOffset={{ x: 0, y: 5 }}
            />
            <Text
              text={sticker.text}
              fontFamily={sticker.fontFamily}
              fontSize={sticker.fontSize}
              fill={sticker.fill}
              padding={16}
              align="center"
            />
          </Label>
        </Group>
      )}

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 확대 제한 등 검증 (width/height 5픽셀 미만이 되지 않도록 방지)
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};
