import { VehicleGene } from '../types';

/**
 * 突然変異
 * 与えられた遺伝子に確率に基づいて変異を加える
 * 
 * @param gene - 元の遺伝子
 * @param mutationRate - 突然変異率 (0.0〜1.0)
 * @returns 変異後の遺伝子
 */
export function mutate(gene: VehicleGene, mutationRate: number): VehicleGene {
  // 深いコピーを作成
  const mutatedGene: VehicleGene = {
    chassis: {
      vertices: gene.chassis.vertices.map(v => [...v] as [number, number])
    },
    wheels: {
      positions: gene.wheels.positions.map(p => [...p] as [number, number]),
      radii: [...gene.wheels.radii]
    }
  };

  // シャーシ頂点の突然変異
  for (let i = 0; i < mutatedGene.chassis.vertices.length; i++) {
    if (Math.random() < mutationRate) {
      // 既存の頂点に小さな変化を加える
      mutatedGene.chassis.vertices[i][0] += (Math.random() - 0.5) * 0.3;
      mutatedGene.chassis.vertices[i][1] += (Math.random() - 0.5) * 0.3;
    }
  }
  
  // 頂点の追加/削除の突然変異 (非常に低確率)
  if (Math.random() < mutationRate * 0.1) {
    if (mutatedGene.chassis.vertices.length < 6 && Math.random() < 0.5) {
      // 頂点追加（最大6頂点まで）
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5;
      mutatedGene.chassis.vertices.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      ]);
    } else if (mutatedGene.chassis.vertices.length > 4) {
      // 頂点削除（最低4頂点は維持）
      const indexToRemove = Math.floor(Math.random() * mutatedGene.chassis.vertices.length);
      mutatedGene.chassis.vertices.splice(indexToRemove, 1);
    }
  }

  // 車輪位置の突然変異
  for (let i = 0; i < 3; i++) {
    if (Math.random() < mutationRate) {
      // 車輪位置に小さな変化を加える
      mutatedGene.wheels.positions[i][0] += (Math.random() - 0.5) * 0.3;
      mutatedGene.wheels.positions[i][1] += (Math.random() - 0.5) * 0.3;
    }
  }

  // 車輪半径の突然変異
  for (let i = 0; i < 3; i++) {
    if (Math.random() < mutationRate) {
      // 車輪半径に小さな変化を加える
      const newRadius = mutatedGene.wheels.radii[i] + (Math.random() - 0.5) * 0.2;
      // 半径が小さすぎたり大きすぎたりしないように制限
      mutatedGene.wheels.radii[i] = Math.max(0.1, Math.min(0.6, newRadius));
    }
  }

  return mutatedGene;
}