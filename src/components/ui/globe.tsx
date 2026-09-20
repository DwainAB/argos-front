"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, type Object3DNode, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";

import countries from "../../../data/globe.json";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: Object3DNode<ThreeGlobe, typeof ThreeGlobe>;
  }
}

const RING_PROPAGATION_SPEED = 3;

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

function Globe({ globeConfig, data }: { globeConfig: GlobeConfig; data: Position[] }) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  useEffect(() => {
    if (!groupRef.current || globeRef.current) return;
    const globe = new ThreeGlobe();
    globeRef.current = globe;
    groupRef.current.add(globe);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !globeRef.current) return;
    const globe = globeRef.current;

    globe
      .hexPolygonsData((countries as { features: object[] }).features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .hexPolygonColor(() => defaultProps.polygonColor);

    globe
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude);

    const material = globe.globeMaterial() as unknown as THREE.MeshPhongMaterial;
    material.color = new THREE.Color(defaultProps.globeColor);
    material.emissive = new THREE.Color(defaultProps.emissive);
    material.emissiveIntensity = defaultProps.emissiveIntensity;
    material.shininess = defaultProps.shininess;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized || !globeRef.current || !data) return;
    const globe = globeRef.current;

    const points = data.flatMap((arc) => [
      {
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      },
      {
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      },
    ]);

    globe
      .arcsData(data)
      .arcStartLat((d: object) => (d as Position).startLat)
      .arcStartLng((d: object) => (d as Position).startLng)
      .arcEndLat((d: object) => (d as Position).endLat)
      .arcEndLng((d: object) => (d as Position).endLng)
      .arcColor((d: object) => (d as Position).color)
      .arcAltitude((d: object) => (d as Position).arcAlt)
      .arcStroke(() => 0.5)
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((d: object) => (d as Position).order)
      .arcDashGap(15)
      .arcDashAnimateTime(defaultProps.arcTime);

    globe
      .pointsData(points)
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(2);

    globe
      .ringsData([])
      .ringColor(() => (t: number) => `rgba(255,255,255,${1 - t})`)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, data]);

  useEffect(() => {
    if (!isInitialized || !globeRef.current || !data) return;
    const globe = globeRef.current;

    let index = 0;
    const interval = setInterval(() => {
      const ringsData = data
        .filter((_, i) => i % 4 === index % 4)
        .map((arc) => ({ lat: arc.startLat, lng: arc.startLng }));
      globe.ringsData(ringsData);
      index += 1;
    }, 2000);

    return () => clearInterval(interval);
  }, [isInitialized, data]);

  return <group ref={groupRef} />;
}

function WorldScene({ globeConfig }: { globeConfig: GlobeConfig }) {
  const { gl, camera } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.set(0, 0, globeConfig.initialPosition ? 300 : 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ambientLight color={globeConfig.ambientLight ?? "#ffffff"} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight ?? "#ffffff"}
        position={[-400, 100, 400]}
      />
      <directionalLight
        color={globeConfig.directionalTopLight ?? "#ffffff"}
        position={[-200, 500, 200]}
      />
      <pointLight
        color={globeConfig.pointLight ?? "#ffffff"}
        position={[-200, 500, 200]}
        intensity={0.8}
      />
    </>
  );
}

export function World({ globeConfig, data }: { globeConfig: GlobeConfig; data: Position[] }) {
  const scene = useMemo(() => {
    const s = new THREE.Scene();
    s.fog = new THREE.Fog(0xffffff, 400, 2000);
    return s;
  }, []);

  return (
    <Canvas scene={scene} camera={{ fov: 50, near: 180, far: 1800, position: [0, 0, 300] }}>
      <WorldScene globeConfig={globeConfig} />
      <Globe globeConfig={globeConfig} data={data} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={200}
        maxDistance={500}
        autoRotate={globeConfig.autoRotate ?? true}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 1}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}
