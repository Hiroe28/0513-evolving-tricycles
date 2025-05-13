import * as planck from 'planck-js';
import { VehicleGene, TrackDifficulty } from '../types';

// 物理シミュレーションの定数
const SCALE = 30; // ピクセル/メートル
const GRAVITY = 9.8;
const TIME_STEP = 1 / 60; // 60fps
const VELOCITY_ITERATIONS = 8;
const POSITION_ITERATIONS = 3;

/**
 * 物理シミュレーションクラス
 */
export class PhysicsSimulation {
  private world: planck.World;
  private vehicles: Map<string, {
    body: planck.Body;
    wheels: planck.Body[];
    joints: planck.Joint[];
    startPosition: planck.Vec2;
  }> = new Map();
  private trackFixtures: planck.Fixture[] = [];
  private timeElapsed: number = 0;
  private _trackDifficulty: TrackDifficulty;

  /**
   * 物理シミュレーションの初期化
   * @param trackDifficulty - コースの難易度
   */
  constructor(trackDifficulty: TrackDifficulty = TrackDifficulty.MEDIUM) {
    this._trackDifficulty = trackDifficulty;
    
    // 物理世界の作成
    this.world = planck.World({
      gravity: planck.Vec2(0, GRAVITY)
    });

    // コースの作成
    this.createTrack(trackDifficulty);
  }

  /**
   * コースを作成
   * @param difficulty - コースの難易度
   */
  private createTrack(difficulty: TrackDifficulty): void {
    // 地面の作成
    const groundBody = this.world.createBody({
      type: 'static'
    });

    // 地面の形状をチェーンで定義
    const groundPoints: planck.Vec2[] = [];
    
    // 地面の起点
    let x = -20;
    let y = 5;
    
    // まず平坦な出発エリアを作成
    groundPoints.push(planck.Vec2(x, y));
    x += 5;
    groundPoints.push(planck.Vec2(x, y));
    
    // コースの長さとランダム性を難易度に応じて調整
    const courseLength = difficulty === TrackDifficulty.EASY ? 30 :
                         difficulty === TrackDifficulty.MEDIUM ? 50 : 70;
    
    // 難易度に応じた起伏の大きさ
    const hillAmplitude = difficulty === TrackDifficulty.EASY ? 0.5 :
                          difficulty === TrackDifficulty.MEDIUM ? 1.0 : 1.5;
    
    // セグメントの長さ
    const segmentLength = difficulty === TrackDifficulty.EASY ? 3 :
                          difficulty === TrackDifficulty.MEDIUM ? 2 : 1.5;
    
    // 地形生成
    while (x < courseLength) {
      // 次のx座標
      x += segmentLength;
      
      // 難易度に応じたノイズを加える
      if (difficulty === TrackDifficulty.EASY) {
        // 緩やかな起伏
        y += (Math.random() - 0.5) * hillAmplitude;
      } else if (difficulty === TrackDifficulty.MEDIUM) {
        // 中程度の起伏と時々小さな段差
        if (Math.random() < 0.2) {
          // 小さな段差
          y += (Math.random() > 0.5 ? 1 : -1) * Math.random() * hillAmplitude;
        } else {
          // 通常の起伏
          y += (Math.random() - 0.5) * hillAmplitude;
        }
      } else {
        // 激しい起伏と頻繁な段差
        if (Math.random() < 0.3) {
          // 大きな段差
          y += (Math.random() > 0.5 ? 1 : -1) * Math.random() * hillAmplitude * 1.5;
        } else {
          // 通常の起伏
          y += (Math.random() - 0.5) * hillAmplitude;
        }
      }
      
      // 地形が低すぎないようにする
      y = Math.max(y, 0);
      
      // 地形が高すぎないようにする
      y = Math.min(y, 10);
      
      groundPoints.push(planck.Vec2(x, y));
    }
    
    // 最後に平坦な終了エリアを追加
    x += 5;
    groundPoints.push(planck.Vec2(x, y));
    
    // チェーン形状を作成して地面ボディに追加
    const groundChain = planck.Chain(groundPoints, false);
    this.trackFixtures.push(groundBody.createFixture({
      shape: groundChain,
      friction: 0.5
    }));
    
    // 難易度に応じて障害物を追加
    if (difficulty !== TrackDifficulty.EASY) {
      const obstacleCount = difficulty === TrackDifficulty.MEDIUM ? 3 : 6;
      
      for (let i = 0; i < obstacleCount; i++) {
        // 障害物の位置：スタート地点から少し離れた位置から配置
        const obstacleX = 10 + (courseLength - 15) * (i + 1) / (obstacleCount + 1);
        let obstacleY = 0;
        
        // 障害物のx座標に最も近い地面の高さを見つける
        for (let j = 1; j < groundPoints.length; j++) {
          if (groundPoints[j].x >= obstacleX && groundPoints[j-1].x <= obstacleX) {
            // 線形補間で地面の高さを計算
            const t = (obstacleX - groundPoints[j-1].x) / (groundPoints[j].x - groundPoints[j-1].x);
            obstacleY = groundPoints[j-1].y * (1 - t) + groundPoints[j].y * t;
            break;
          }
        }
        
        // 障害物を作成
        const obstacleBody = this.world.createBody({
          type: 'static',
          position: planck.Vec2(obstacleX, obstacleY - 0.5) // 地面に埋め込む
        });
        
        // 障害物の形状（坂や箱など）
        if (Math.random() < 0.5) {
          // 箱型障害物
          const boxWidth = 0.5 + Math.random() * 0.5;
          const boxHeight = 0.5 + Math.random() * 0.5;
          const box = planck.Box(boxWidth, boxHeight);
          this.trackFixtures.push(obstacleBody.createFixture({
            shape: box,
            friction: 0.5
          }));
        } else {
          // 三角形の障害物
          const triangleHeight = 0.5 + Math.random() * 0.5;
          const triangleBase = 0.8 + Math.random() * 0.5;
          const triangle = planck.Polygon([
            planck.Vec2(-triangleBase/2, 0),
            planck.Vec2(triangleBase/2, 0),
            planck.Vec2(0, triangleHeight)
          ]);
          this.trackFixtures.push(obstacleBody.createFixture({
            shape: triangle,
            friction: 0.5
          }));
        }
      }
    }
  }

  /**
   * 車両を追加
   * @param id - 車両の一意なID
   * @param gene - 車両の遺伝子
   * @returns 車両の開始位置
   */
  addVehicle(id: string, gene: VehicleGene): planck.Vec2 {
    // 車両本体（シャーシ）の作成
    const chassisBody = this.world.createBody({
      type: 'dynamic',
      position: planck.Vec2(0, 3), // スタート位置
      allowSleep: false
    });
    
    // シャーシの形状を遺伝子から作成
    const vertices: planck.Vec2[] = gene.chassis.vertices.map((v) => 
      planck.Vec2(v[0], v[1])
    );
    
    const chassisShape = planck.Polygon(vertices);
    chassisBody.createFixture({
      shape: chassisShape,
      density: 5.0,
      friction: 0.5,
      restitution: 0.2
    });
    
    // 車輪の作成
    const wheels: planck.Body[] = [];
    const joints: planck.Joint[] = [];
    
    for (let i = 0; i < 3; i++) {
      // 車輪の位置と半径を遺伝子から取得
      const wheelPos = gene.wheels.positions[i];
      const wheelRadius = gene.wheels.radii[i];
      
      // 車輪ボディの作成
      const wheelBody = this.world.createBody({
        type: 'dynamic',
        position: chassisBody.getPosition().clone().add(planck.Vec2(wheelPos[0], wheelPos[1])),
        allowSleep: false
      });
      
      // 車輪の形状（円）
      const wheelShape = planck.Circle(wheelRadius);
      wheelBody.createFixture({
        shape: wheelShape,
        density: 1.0,
        friction: 0.9,
        restitution: 0.1
      });
      
      // シャーシと車輪をジョイントで接続
      // @ts-ignore - planck.jsの型定義と実際の使い方が合っていないため
      const joint = this.world.createJoint(planck.RevoluteJoint({
        motorSpeed: 0.0,
        maxMotorTorque: 10.0,
        enableMotor: true
      }, chassisBody, wheelBody, wheelBody.getPosition()));
      
      wheels.push(wheelBody);
      joints.push(joint);
    }
    
    // 車両情報を保存
    this.vehicles.set(id, {
      body: chassisBody,
      wheels,
      joints,
      startPosition: chassisBody.getPosition().clone()
    });
    
    return chassisBody.getPosition().clone();
  }

  /**
   * 車両にトルクを与えて動かす
   * @param id - 車両ID
   * @param torque - トルク値（正：前進、負：後退）
   */
  applyTorque(id: string, torque: number): void {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return;
    
    // すべての車輪に同じトルクを適用
    for (const joint of vehicle.joints) {
      if (joint) {
        const revoluteJoint = joint as planck.RevoluteJoint;
        revoluteJoint.setMotorSpeed(torque);
      }
    }
  }

  /**
   * シミュレーションを1ステップ進める
   * @param dt - 時間ステップ（秒）
   */
  step(dt: number = TIME_STEP): void {
    this.world.step(dt, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
    this.timeElapsed += dt;
  }

  /**
   * 車両の現在位置を取得
   * @param id - 車両ID
   * @returns 車両の現在位置
   */
  getVehiclePosition(id: string): planck.Vec2 | null {
    const vehicle = this.vehicles.get(id);
    return vehicle ? vehicle.body.getPosition() : null;
  }

  /**
   * 車両の移動距離を計算
   * @param id - 車両ID
   * @returns 水平方向の移動距離
   */
  getVehicleDistance(id: string): number {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return 0;
    
    const currentPos = vehicle.body.getPosition();
    const startPos = vehicle.startPosition;
    
    // 水平方向の移動距離を計算
    return currentPos.x - startPos.x;
  }

  /**
   * 車両の回転角度を取得
   * @param id - 車両ID
   * @returns 回転角度（ラジアン）
   */
  getVehicleAngle(id: string): number | null {
    const vehicle = this.vehicles.get(id);
    return vehicle ? vehicle.body.getAngle() : null;
  }

  /**
   * シミュレーションをリセット
   */
  reset(): void {
    // 既存の車両をすべて削除
    for (const vehicle of this.vehicles.values()) {
      for (const wheel of vehicle.wheels) {
        this.world.destroyBody(wheel);
      }
      this.world.destroyBody(vehicle.body);
    }
    
    this.vehicles.clear();
    this.timeElapsed = 0;
  }

  /**
   * 車両データを取得（レンダリング用）
   * @param id - 車両ID
   * @returns 車両のレンダリングに必要なデータ
   */
  getVehicleRenderData(id: string): any {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return null;
    
    // シャーシの形状とトランスフォームを取得
    const chassisPosition = vehicle.body.getPosition();
    const chassisAngle = vehicle.body.getAngle();
    
    // Fixtureからシャーシの頂点を取得
    const chassisFixture = vehicle.body.getFixtureList();
    if (!chassisFixture) return null;
    
    const chassisShape = chassisFixture.getShape();
    if (!chassisShape || chassisShape.getType() !== 'polygon') {
      return null;
    }
    
    // planck.jsのPolygonはgetVertexCountの代わりにm_countを持っていることがある
    // そのため、両方の方法でアクセスを試みる
    let vertexCount = 0;
    let vertices: any[] = [];
    
    // @ts-ignore - planck.jsの内部実装にアクセス
    if (typeof chassisShape.m_count === 'number') {
      // @ts-ignore - planck.jsの内部実装にアクセス
      vertexCount = chassisShape.m_count;
      
      // 頂点を取得
      for (let i = 0; i < vertexCount; i++) {
        // @ts-ignore - planck.jsの内部実装にアクセス
        if (chassisShape.m_vertices && i < chassisShape.m_vertices.length) {
          // @ts-ignore - planck.jsの内部実装にアクセス
          const vertex = chassisShape.m_vertices[i];
          if (vertex) vertices.push(vertex);
        }
      }
    } else if (typeof chassisShape.getVertexCount === 'function') {
      // 標準的なAPIがある場合
      vertexCount = chassisShape.getVertexCount();
      
      for (let i = 0; i < vertexCount; i++) {
        const vertex = chassisShape.getVertex(i);
        if (vertex) vertices.push(vertex);
      }
    }
    
    // 車輪のデータを取得
    const wheelsData = vehicle.wheels.map(wheel => {
      const position = wheel.getPosition();
      const angle = wheel.getAngle();
      const fixture = wheel.getFixtureList();
      
      if (!fixture) return { position: { x: 0, y: 0 }, angle: 0, radius: 0.3 };
      
      const shape = fixture.getShape();
      let radius = 0.3; // デフォルト値
      
      if (shape) {
        if (shape.getType() === 'circle') {
          // @ts-ignore - planck.jsの内部実装にアクセス
          radius = shape.m_radius || shape.getRadius();
        } else {
          // 円ではない場合のフォールバック
          radius = shape.getRadius();
        }
      }
      
      return {
        position: { x: position.x, y: position.y },
        angle,
        radius
      };
    });
    
    return {
      chassis: {
        position: { x: chassisPosition.x, y: chassisPosition.y },
        angle: chassisAngle,
        vertices: vertices.map(v => ({ x: v.x, y: v.y }))
      },
      wheels: wheelsData
    };
  }

  /**
   * コースデータを取得（レンダリング用）
   * @returns コースのレンダリングに必要なデータ
   */
  getTrackRenderData(): any[] {
    const trackData: any[] = [];
    
    // すべてのトラックフィクスチャを処理
    for (const fixture of this.trackFixtures) {
      const shape = fixture.getShape();
      if (!shape) continue;
      
      const body = fixture.getBody();
      const bodyPosition = body.getPosition();
      const bodyAngle = body.getAngle();
      
      // チェーン形状（地面）
      if (shape.getType() === 'chain') {
        // @ts-ignore - planck.jsの内部実装にアクセス
        const vertexCount = shape.m_count || 0;
        const vertices: { x: number, y: number }[] = [];
        
        // @ts-ignore - planck.jsの内部実装にアクセス
        if (shape.m_vertices) {
          // すべての頂点を取得
          // @ts-ignore - planck.jsの内部実装にアクセス
          for (let i = 0; i < vertexCount; i++) {
            // @ts-ignore - planck.jsの内部実装にアクセス
            if (i < shape.m_vertices.length) {
              // @ts-ignore - planck.jsの内部実装にアクセス
              const vertex = shape.m_vertices[i];
              if (vertex) {
                vertices.push({
                  x: bodyPosition.x + vertex.x,
                  y: bodyPosition.y + vertex.y
                });
              }
            }
          }
        } else if (typeof shape.getChildCount === 'function') {
          // 標準APIを使用
          const childCount = shape.getChildCount();
          
          for (let i = 0; i < childCount; i++) {
            const childEdge = shape.getChildEdge(i);
            const vertex = childEdge.getVertex1();
            vertices.push({
              x: bodyPosition.x + vertex.x,
              y: bodyPosition.y + vertex.y
            });
            
            // 最後のエッジの終点も追加
            if (i === childCount - 1) {
              const lastVertex = childEdge.getVertex2();
              vertices.push({
                x: bodyPosition.x + lastVertex.x,
                y: bodyPosition.y + lastVertex.y
              });
            }
          }
        }
        
        if (vertices.length > 0) {
          trackData.push({
            type: 'chain',
            vertices
          });
        }
      }
      // ポリゴン形状（障害物など）
      else if (shape.getType() === 'polygon') {
        // @ts-ignore - planck.jsの内部実装にアクセス
        const vertexCount = shape.m_count || 0;
        const vertices: { x: number, y: number }[] = [];
        
        // @ts-ignore - planck.jsの内部実装にアクセス
        if (shape.m_vertices) {
          // @ts-ignore - planck.jsの内部実装にアクセス
          for (let i = 0; i < vertexCount && i < shape.m_vertices.length; i++) {
            // @ts-ignore - planck.jsの内部実装にアクセス
            const vertex = shape.m_vertices[i];
            if (vertex) {
              // ボディの位置と回転を考慮して変換
              const worldX = bodyPosition.x + vertex.x * Math.cos(bodyAngle) - vertex.y * Math.sin(bodyAngle);
              const worldY = bodyPosition.y + vertex.x * Math.sin(bodyAngle) + vertex.y * Math.cos(bodyAngle);
              
              vertices.push({ x: worldX, y: worldY });
            }
          }
        } else if (typeof shape.getVertexCount === 'function') {
          const vCount = shape.getVertexCount();
          for (let i = 0; i < vCount; i++) {
            const vertex = shape.getVertex(i);
            
            // ボディの位置と回転を考慮して変換
            const worldX = bodyPosition.x + vertex.x * Math.cos(bodyAngle) - vertex.y * Math.sin(bodyAngle);
            const worldY = bodyPosition.y + vertex.x * Math.sin(bodyAngle) + vertex.y * Math.cos(bodyAngle);
            
            vertices.push({ x: worldX, y: worldY });
          }
        }
        
        if (vertices.length > 0) {
          trackData.push({
            type: 'polygon',
            vertices
          });
        }
      }
      // 円形状（円形の障害物など）
      else if (shape.getType() === 'circle') {
        // @ts-ignore - planck.jsの内部実装にアクセス
        const radius = shape.m_radius || shape.getRadius();
        // @ts-ignore - planck.jsの内部実装にアクセス
        const center = shape.m_p || { x: 0, y: 0 };
        
        // ボディの位置と回転を考慮して変換
        const worldX = bodyPosition.x + center.x * Math.cos(bodyAngle) - center.y * Math.sin(bodyAngle);
        const worldY = bodyPosition.y + center.x * Math.sin(bodyAngle) + center.y * Math.cos(bodyAngle);
        
        trackData.push({
          type: 'circle',
          center: { x: worldX, y: worldY },
          radius
        });
      }
    }
    
    return trackData;
  }

  /**
   * シミュレーションのスケール係数を取得
   * @returns スケール係数（ピクセル/メートル）
   */
  getScale(): number {
    return SCALE;
  }

  /**
   * 経過時間を取得
   * @returns 経過時間（秒）
   */
  getTimeElapsed(): number {
    return this.timeElapsed;
  }
  
  /**
   * トラック難易度を取得
   */
  get trackDifficulty(): TrackDifficulty {
    return this._trackDifficulty;
  }
}