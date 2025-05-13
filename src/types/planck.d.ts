// planck-jsの型定義拡張
declare module 'planck-js' {
  // 基本型
  export interface Vec2 {
    x: number;
    y: number;
    clone(): Vec2;
    add(v: Vec2): Vec2;
  }

  // ワールド
  export interface WorldDef {
    gravity?: Vec2;
    allowSleep?: boolean;
  }

  export interface World {
    createBody(def: any): Body;
    createJoint(def: any): Joint;
    step(timeStep: number, velocityIterations: number, positionIterations: number): void;
    destroyBody(body: Body): void;
    destroyJoint(joint: Joint): void;
  }

  // ボディ
  export interface BodyDef {
    type?: 'static' | 'dynamic' | 'kinematic';
    position?: Vec2;
    angle?: number;
    linearVelocity?: Vec2;
    angularVelocity?: number;
    linearDamping?: number;
    angularDamping?: number;
    allowSleep?: boolean;
    awake?: boolean;
    fixedRotation?: boolean;
    bullet?: boolean;
    active?: boolean;
    userData?: any;
  }

  export interface Body {
    createFixture(def: any): Fixture;
    getPosition(): Vec2;
    getAngle(): number;
    getFixtureList(): Fixture | null;
    applyForce(force: Vec2, point: Vec2, wake?: boolean): void;
    applyTorque(torque: number, wake?: boolean): void;
    applyLinearImpulse(impulse: Vec2, point: Vec2, wake?: boolean): void;
    applyAngularImpulse(impulse: number, wake?: boolean): void;
    setTransform(position: Vec2, angle: number): void;
    setLinearVelocity(v: Vec2): void;
    setAngularVelocity(omega: number): void;
    getLinearVelocity(): Vec2;
    getAngularVelocity(): number;
  }

  // フィクスチャー
  export interface FixtureDef {
    shape: Shape;
    userData?: any;
    friction?: number;
    restitution?: number;
    density?: number;
    isSensor?: boolean;
    filterCategoryBits?: number;
    filterMaskBits?: number;
    filterGroupIndex?: number;
  }

  export interface Fixture {
    getShape(): Shape;
    getBody(): Body;
    getUserData(): any;
    setUserData(data: any): void;
    isSensor(): boolean;
    setSensor(sensor: boolean): void;
    getDensity(): number;
    setDensity(density: number): void;
    getFriction(): number;
    setFriction(friction: number): void;
    getRestitution(): number;
    setRestitution(restitution: number): void;
  }

  // シェイプ
  export interface Shape {
    getType(): string;
    getRadius(): number;
  }

  export interface Circle extends Shape {
    getCenter(): Vec2;
    getRadius(): number;
  }

  export interface Chain extends Shape {
    getChildCount(): number;
    getChildEdge(index: number): Edge;
  }

  export interface Edge extends Shape {
    getVertex1(): Vec2;
    getVertex2(): Vec2;
  }

  export interface Polygon extends Shape {
    getVertexCount(): number;
    getVertex(index: number): Vec2;
  }

  // ジョイント
  export interface JointDef {
    collideConnected?: boolean;
    userData?: any;
  }

  export interface RevoluteJointDef {
    localAnchorA?: Vec2;
    localAnchorB?: Vec2;
    referenceAngle?: number;
    enableLimit?: boolean;
    lowerAngle?: number;
    upperAngle?: number;
    enableMotor?: boolean;
    motorSpeed?: number;
    maxMotorTorque?: number;
  }

  export interface Joint {
    getBodyA(): Body;
    getBodyB(): Body;
    getNext(): Joint | null;
    getUserData(): any;
    setUserData(data: any): void;
    getCollideConnected(): boolean;
    getReactionForce(inv_dt: number): Vec2;
    getReactionTorque(inv_dt: number): number;
  }

  export interface RevoluteJoint extends Joint {
    setMotorSpeed(speed: number): void;
    getMotorSpeed(): number;
    setMaxMotorTorque(torque: number): void;
    getMaxMotorTorque(): number;
    enableMotor(flag: boolean): void;
    isMotorEnabled(): boolean;
    getMotorTorque(inv_dt: number): number;
  }

  // ファクトリー関数
  export function World(def?: WorldDef): World;
  export function Vec2(x?: number, y?: number): Vec2;
  export function Box(hx: number, hy: number, center?: Vec2, angle?: number): Polygon;
  export function Circle(radius: number, center?: Vec2): Circle;
  export function Polygon(vertices: Vec2[]): Polygon;
  export function Chain(vertices: Vec2[], closed?: boolean): Chain;
  export function Edge(v1: Vec2, v2: Vec2): Edge;
  export function RevoluteJoint(def: RevoluteJointDef, bodyA: Body, bodyB: Body, anchor: Vec2): RevoluteJoint;
}