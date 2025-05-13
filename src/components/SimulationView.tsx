import React, { useRef, useEffect } from 'react';
import { Stage, Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

// レンダリングデータの型定義
interface VehicleRenderData {
  id: string;
  isElite: boolean;
  isBest: boolean;
  highlight: boolean;
  fitness: number;
  data: {
    chassis: {
      position: { x: number, y: number };
      angle: number;
      vertices: { x: number, y: number }[];
    };
    wheels: {
      position: { x: number, y: number };
      angle: number;
      radius: number;
    }[];
  };
}

interface TrackRenderData {
  type: 'chain' | 'polygon' | 'circle';
  vertices?: { x: number, y: number }[];
  center?: { x: number, y: number };
  radius?: number;
}

interface SimulationViewProps {
  renderData: {
    vehicles: VehicleRenderData[];
    track: TrackRenderData[];
    scale: number;
  } | null;
  width: number;
  height: number;
}

/**
 * 車両を描画するコンポーネント
 */
const Vehicle = ({ data, scale }: { data: VehicleRenderData; scale: number }) => {
  const graphicsRef = useRef<PIXI.Graphics>(null);

  // 車両の描画を更新
  useEffect(() => {
    const graphics = graphicsRef.current;
    if (!graphics || !data.data) return;

    graphics.clear();

    const { chassis, wheels } = data.data;
    const position = chassis.position;
    const angle = chassis.angle;

    // シャーシの描画
    graphics.lineStyle(2, 0x000000, 1);
    
    // 車両の色を決定
    let fillColor = 0xAAAAAA; // 通常色
    
    if (data.highlight) {
      fillColor = 0xFFFF00; // ハイライト表示の場合は黄色
    } else if (data.isBest) {
      fillColor = 0x00FF00; // ベスト個体は緑
    } else if (data.isElite) {
      fillColor = 0x00AAFF; // エリート個体は青
    }
    
    graphics.beginFill(fillColor, 0.8);

    // シャーシの頂点を描画
    const worldVertices = chassis.vertices.map(vertex => {
      // 回転と位置を考慮した変換
      const rotatedX = vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle);
      const rotatedY = vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle);
      
      return {
        x: (position.x + rotatedX) * scale,
        y: (position.y + rotatedY) * scale
      };
    });

    if (worldVertices.length > 0) {
      graphics.moveTo(worldVertices[0].x, worldVertices[0].y);
      for (let i = 1; i < worldVertices.length; i++) {
        graphics.lineTo(worldVertices[i].x, worldVertices[i].y);
      }
      graphics.lineTo(worldVertices[0].x, worldVertices[0].y);
    }
    
    graphics.endFill();

    // 車輪の描画
    for (const wheel of wheels) {
      const wheelPosition = wheel.position;
      const wheelAngle = wheel.angle;
      const radius = wheel.radius * scale;

      // 車輪の円を描画
      graphics.lineStyle(2, 0x000000, 1);
      graphics.beginFill(0x333333, 0.8);
      graphics.drawCircle(wheelPosition.x * scale, wheelPosition.y * scale, radius);
      graphics.endFill();

      // 回転方向を示す線を描画
      const lineEndX = wheelPosition.x * scale + Math.cos(wheelAngle) * radius;
      const lineEndY = wheelPosition.y * scale + Math.sin(wheelAngle) * radius;
      
      graphics.lineStyle(1, 0xFFFFFF, 1);
      graphics.moveTo(wheelPosition.x * scale, wheelPosition.y * scale);
      graphics.lineTo(lineEndX, lineEndY);
    }
  }, [data, scale]);

  return <Graphics ref={graphicsRef} />;
};

/**
 * トラックを描画するコンポーネント
 */
const Track = ({ data, scale }: { data: TrackRenderData[]; scale: number }) => {
  const graphicsRef = useRef<PIXI.Graphics>(null);

  useEffect(() => {
    const graphics = graphicsRef.current;
    if (!graphics) return;

    graphics.clear();

    // 地面の描画色
    const groundColor = 0x8B4513; // 茶色
    const obstacleColor = 0x555555; // 灰色

    for (const item of data) {
      if (item.type === 'chain' && item.vertices) {
        // 地面のチェーンを描画
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginFill(groundColor, 1);
        
        if (item.vertices.length > 0) {
          graphics.moveTo(item.vertices[0].x * scale, item.vertices[0].y * scale);
          
          for (let i = 1; i < item.vertices.length; i++) {
            graphics.lineTo(item.vertices[i].x * scale, item.vertices[i].y * scale);
          }
          
          // 地面を閉じるための追加の線
          const lastVertex = item.vertices[item.vertices.length - 1];
          const firstVertex = item.vertices[0];
          
          // 下側に大きな四角形を描いて地面を表現
          graphics.lineTo(lastVertex.x * scale, lastVertex.y * scale + 500);
          graphics.lineTo(firstVertex.x * scale, firstVertex.y * scale + 500);
          graphics.lineTo(firstVertex.x * scale, firstVertex.y * scale);
        }
        
        graphics.endFill();
      } else if (item.type === 'polygon' && item.vertices) {
        // 多角形の障害物を描画
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginFill(obstacleColor, 1);
        
        if (item.vertices.length > 0) {
          graphics.moveTo(item.vertices[0].x * scale, item.vertices[0].y * scale);
          
          for (let i = 1; i < item.vertices.length; i++) {
            graphics.lineTo(item.vertices[i].x * scale, item.vertices[i].y * scale);
          }
          
          graphics.lineTo(item.vertices[0].x * scale, item.vertices[0].y * scale);
        }
        
        graphics.endFill();
      } else if (item.type === 'circle' && item.center && item.radius) {
        // 円形の障害物を描画
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginFill(obstacleColor, 1);
        graphics.drawCircle(
          item.center.x * scale,
          item.center.y * scale,
          item.radius * scale
        );
        graphics.endFill();
      }
    }
  }, [data, scale]);

  return <Graphics ref={graphicsRef} />;
};

/**
 * シミュレーション表示コンポーネント
 */
const SimulationView: React.FC<SimulationViewProps> = ({ renderData, width, height }) => {
  const stageRef = useRef<PIXI.Container>(null);
  
  // カメラの設定
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // ステージの位置を調整してカメラの見える範囲を設定
    stage.x = width / 2;
    stage.y = height * 0.7; // 地面が下方向に表示されるように調整
  }, [width, height]);
  
  if (!renderData) {
    return (
      <div style={{ width, height, backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>シミュレーションデータが読み込まれていません</p>
      </div>
    );
  }

  return (
    <Stage width={width} height={height} options={{ backgroundColor: 0xE0E0E0 }}>
      <Container ref={stageRef}>
        <Track data={renderData.track} scale={renderData.scale} />
        {renderData.vehicles.map((vehicle) => (
          <Vehicle key={vehicle.id} data={vehicle} scale={renderData.scale} />
        ))}
      </Container>
    </Stage>
  );
};

export default SimulationView;