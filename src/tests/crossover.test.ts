import { describe, it, expect } from 'vitest';
import { crossover } from '../core/ga/crossover';
import { VehicleGene } from '../core/types';

describe('Crossover Algorithm', () => {
  // テスト用の親遺伝子の作成
  const parent1: VehicleGene = {
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

  const parent2: VehicleGene = {
    chassis: {
      vertices: [
        [0, 0],
        [1, 0],
        [0.5, 0.5],
        [0, 1],
        [1, 1],
      ],
    },
    wheels: {
      positions: [
        [0.2, 0],
        [0, 0.8],
        [1, 0.8],
      ],
      radii: [0.3, 0.2, 0.5],
    },
  };

  it('交叉によって新しい遺伝子が生成される', () => {
    const child = crossover(parent1, parent2);

    // 子の遺伝子構造チェック
    expect(child).toBeDefined();
    expect(child.chassis).toBeDefined();
    expect(child.wheels).toBeDefined();
    expect(child.wheels.positions.length).toBe(3);
    expect(child.wheels.radii.length).toBe(3);

    // 子はどちらかの親のシャーシを継承している
    const childVerticesCount = child.chassis.vertices.length;
    const matchesParent1 = childVerticesCount === parent1.chassis.vertices.length;
    const matchesParent2 = childVerticesCount === parent2.chassis.vertices.length;
    expect(matchesParent1 || matchesParent2).toBe(true);

    // 各部分は親のいずれかの値を継承している
    for (let i = 0; i < 3; i++) {
      const wheelPositionMatchesParent1 = 
        child.wheels.positions[i][0] === parent1.wheels.positions[i][0] && 
        child.wheels.positions[i][1] === parent1.wheels.positions[i][1];
      
      const wheelPositionMatchesParent2 = 
        child.wheels.positions[i][0] === parent2.wheels.positions[i][0] && 
        child.wheels.positions[i][1] === parent2.wheels.positions[i][1];
      
      expect(wheelPositionMatchesParent1 || wheelPositionMatchesParent2).toBe(true);
      
      const radiusMatchesParent1 = child.wheels.radii[i] === parent1.wheels.radii[i];
      const radiusMatchesParent2 = child.wheels.radii[i] === parent2.wheels.radii[i];
      
      expect(radiusMatchesParent1 || radiusMatchesParent2).toBe(true);
    }
  });

  it('複数回交叉を行うと異なる子が生成される', () => {
    // 複数回交叉を実行
    const children: VehicleGene[] = [];
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      children.push(crossover(parent1, parent2));
    }
    
    // 生成された子の中に異なるものがあることを確認
    let allIdentical = true;
    const firstChild = children[0];
    
    for (let i = 1; i < children.length; i++) {
      const currentChild = children[i];
      
      // シャーシの形状が異なるか車輪の特性が異なれば遺伝子は異なる
      if (
        currentChild.chassis.vertices.length !== firstChild.chassis.vertices.length ||
        JSON.stringify(currentChild.wheels) !== JSON.stringify(firstChild.wheels)
      ) {
        allIdentical = false;
        break;
      }
    }
    
    // 少なくとも1つの異なる子が生成されているはず
    expect(allIdentical).toBe(false);
  });
});