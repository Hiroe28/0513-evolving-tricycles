import { describe, it, expect } from 'vitest';
import { mutate } from '../core/ga/mutation';
import { VehicleGene } from '../core/types';

describe('Mutation Algorithm', () => {
  // テスト用の遺伝子
  const originalGene: VehicleGene = {
    chassis: {
      vertices: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
    wheels: {
      positions: [
        [0.5, 0],
        [0, 0.5],
        [1, 0.5],
      ],
      radii: [0.2, 0.3, 0.4],
    },
  };

  it('突然変異率0では変異が起きない', () => {
    const mutatedGene = mutate(originalGene, 0);
    
    // ディープイコール: 値の比較
    expect(JSON.stringify(mutatedGene)).toBe(JSON.stringify(originalGene));
  });

  it('突然変異率1では必ず変異が起きる', () => {
    const mutatedGene = mutate(originalGene, 1);
    
    // 何らかの変化があることを検証
    let hasChanged = false;
    
    // シャーシの頂点をチェック
    for (let i = 0; i < Math.min(originalGene.chassis.vertices.length, mutatedGene.chassis.vertices.length); i++) {
      if (
        originalGene.chassis.vertices[i][0] !== mutatedGene.chassis.vertices[i][0] ||
        originalGene.chassis.vertices[i][1] !== mutatedGene.chassis.vertices[i][1]
      ) {
        hasChanged = true;
        break;
      }
    }
    
    // 変化がなければ車輪をチェック
    if (!hasChanged) {
      for (let i = 0; i < 3; i++) {
        if (
          originalGene.wheels.positions[i][0] !== mutatedGene.wheels.positions[i][0] ||
          originalGene.wheels.positions[i][1] !== mutatedGene.wheels.positions[i][1] ||
          originalGene.wheels.radii[i] !== mutatedGene.wheels.radii[i]
        ) {
          hasChanged = true;
          break;
        }
      }
    }
    
    // または頂点数が変わっている可能性もある
    if (!hasChanged && originalGene.chassis.vertices.length !== mutatedGene.chassis.vertices.length) {
      hasChanged = true;
    }
    
    expect(hasChanged).toBe(true);
  });

  it('変異後の車輪の半径は制限内に収まる', () => {
    // 高い変異率で複数回テスト
    const iterations = 50;
    
    for (let i = 0; i < iterations; i++) {
      const mutatedGene = mutate(originalGene, 0.5);
      
      // すべての車輪の半径が制限内にあることを確認
      for (const radius of mutatedGene.wheels.radii) {
        expect(radius).toBeGreaterThanOrEqual(0.1);
        expect(radius).toBeLessThanOrEqual(0.6);
      }
    }
  });

  it('シャーシの頂点数は4〜6点の範囲内に収まる', () => {
    // 高い変異率で複数回テスト
    const iterations = 50;
    
    for (let i = 0; i < iterations; i++) {
      const mutatedGene = mutate(originalGene, 0.5);
      
      // シャーシの頂点数が範囲内であることを確認
      expect(mutatedGene.chassis.vertices.length).toBeGreaterThanOrEqual(4);
      expect(mutatedGene.chassis.vertices.length).toBeLessThanOrEqual(6);
    }
  });
});