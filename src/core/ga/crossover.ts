import { VehicleGene } from '../types';

/**
 * 交叉（クロスオーバー）
 * 2つの親の遺伝子を組み合わせて新しい遺伝子を生成する
 * 
 * @param parent1 - 親1の遺伝子
 * @param parent2 - 親2の遺伝子
 * @returns 子の遺伝子
 */
export function crossover(parent1: VehicleGene, parent2: VehicleGene): VehicleGene {
  // シャーシの交叉: どちらかの親のシャーシをランダムに選ぶ
  // シャーシは頂点数が異なる可能性があるためシンプルに選択
  const childChassis = Math.random() < 0.5 
    ? { vertices: [...parent1.chassis.vertices] } 
    : { vertices: [...parent2.chassis.vertices] };

  // 車輪の交叉: 各車輪について、どちらの親から引き継ぐかをランダムに決定
  const childWheelPositions: [number, number][] = [];
  const childWheelRadii: number[] = [];

  for (let i = 0; i < 3; i++) {
    // 車輪位置の交叉
    const wheelPos = Math.random() < 0.5 
      ? [...parent1.wheels.positions[i]] 
      : [...parent2.wheels.positions[i]];
    childWheelPositions.push(wheelPos as [number, number]);
    
    // 車輪半径の交叉
    childWheelRadii.push(
      Math.random() < 0.5 ? parent1.wheels.radii[i] : parent2.wheels.radii[i]
    );
  }

  return {
    chassis: childChassis,
    wheels: {
      positions: childWheelPositions,
      radii: childWheelRadii
    }
  };
}