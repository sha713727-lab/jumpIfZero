"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Float,
  Text3D,
} from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  AdditiveBlending,
  Color,
  type Group,
  MathUtils,
  MeshPhysicalMaterial,
  type Mesh,
  type PointLight,
  ShaderMaterial,
  Vector2,
} from "three";
import { colors } from "@/constants/colors";

type PointerState = {
  target: Vector2;
  current: Vector2;
  velocity: Vector2;
  scratch: Vector2;
  active: number;
};

type ShaderUniforms = {
  uniforms: {
    uMouse: { value: Vector2 };
    uAmp: { value: number };
    uTime: { value: number };
    uGlow: { value: number };
  };
};

function createPointer(): PointerState {
  return {
    target: new Vector2(0, 0),
    current: new Vector2(0, 0),
    velocity: new Vector2(0, 0),
    scratch: new Vector2(0, 0),
    active: 0,
  };
}

function BalloonWelcome({
  pointer,
  reduceMotion,
  shellRef,
}: {
  readonly pointer: PointerState;
  readonly reduceMotion: boolean;
  readonly shellRef: RefObject<HTMLDivElement | null>;
}) {
  const groupRef = useRef<Group>(null);
  const introRef = useRef(reduceMotion ? 1 : 0);
  const breathRef = useRef(0);
  const ampRef = useRef(0);
  const { viewport } = useThree();

  const material = useMemo(() => {
    const mat = new MeshPhysicalMaterial({
      color: new Color(colors.secondary),
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.22,
      sheen: 0.55,
      sheenRoughness: 0.45,
      sheenColor: new Color(colors.brand),
      reflectivity: 0.35,
      envMapIntensity: 0.45,
      emissive: new Color(colors.secondary),
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: reduceMotion ? 1 : 0,
      toneMapped: true,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uMouse = { value: new Vector2(0, 0) };
      shader.uniforms.uAmp = { value: 0 };
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uGlow = { value: 0 };
      mat.userData.shader = shader;

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        /* glsl */ `
        uniform vec2 uMouse;
        uniform float uAmp;
        uniform float uTime;
        uniform float uGlow;
        varying float vHoverGlow;
        void main() {
        `,
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        /* glsl */ `
        #include <begin_vertex>
        {
          transformed += normal * 0.045;
          vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
          vec2 anchor = uMouse * vec2(3.6, 1.5);
          vec2 delta = wp.xy - anchor;
          float dist = length(delta);
          float influence = exp(-dist * dist * 1.25) * uAmp;
          vec2 dir = length(delta) > 0.0001 ? normalize(delta) : vec2(0.0);
          float pulse = 0.9 + 0.1 * sin(uTime * 2.4 + dist * 3.2);
          transformed += normal * influence * 0.34 * pulse;
          transformed.xy += dir * influence * 0.1;
          vHoverGlow = exp(-dist * dist * 1.8) * uGlow;
        }
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        /* glsl */ `
        varying float vHoverGlow;
        uniform float uTime;
        void main() {
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        #include <opaque_fragment>
        {
          float shimmer = 0.82 + 0.18 * sin(uTime * 3.1 + vHoverGlow * 8.0);
          vec3 warm = vec3(0.98, 0.63, 0.22);
          vec3 soft = vec3(0.98, 0.96, 0.92);
          gl_FragColor.rgb += mix(warm, soft, 0.62) * vHoverGlow * 0.55 * shimmer;
          gl_FragColor.rgb += soft * vHoverGlow * 0.22;
        }
        `,
      );
    };

    mat.needsUpdate = true;
    return mat;
  }, [reduceMotion]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  const glowRef = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033);
    const t = state.clock.elapsedTime;

    if (!reduceMotion) {
      introRef.current = MathUtils.damp(introRef.current, 1, 1.5, dt);
      breathRef.current = Math.sin(t * 1.2) * 0.016;
      pointer.scratch.copy(pointer.target).sub(pointer.current);
      pointer.velocity.lerp(pointer.scratch, 1 - Math.exp(-10 * dt));
      pointer.current.lerp(pointer.target, 1 - Math.exp(-7 * dt));
      const speed = Math.min(1, pointer.velocity.length() * 3);
      const hoverBoost = 0.28 + pointer.active * 0.85 + speed * 0.75;
      ampRef.current = MathUtils.damp(ampRef.current, hoverBoost, 6, dt);
      glowRef.current = MathUtils.damp(
        glowRef.current,
        pointer.active * (0.75 + speed * 0.55),
        7,
        dt,
      );
    } else {
      introRef.current = 1;
      ampRef.current = 0;
      glowRef.current = 0;
      pointer.current.set(0, 0);
    }

    const intro = introRef.current;
    material.opacity = intro;
    material.emissiveIntensity = 0.1 + glowRef.current * 0.35;

    const shell = shellRef.current;
    if (shell && !reduceMotion) {
      shell.style.opacity = String(0.35 + intro * 0.65);
    }

    const shader = material.userData.shader as ShaderUniforms | undefined;
    if (shader) {
      shader.uniforms.uMouse.value.copy(pointer.current);
      shader.uniforms.uAmp.value = ampRef.current * intro;
      shader.uniforms.uTime.value = t;
      shader.uniforms.uGlow.value = glowRef.current * intro;
    }

    if (groupRef.current) {
      const scaleBase = Math.min(1.15, viewport.width / 14.5);
      const enterScale = 0.8 + intro * 0.2;
      const breath = 1 + breathRef.current;
      groupRef.current.scale.setScalar(scaleBase * enterScale * breath);
      groupRef.current.rotation.x =
        pointer.current.y * -0.1 + Math.sin(t * 0.85) * 0.02;
      groupRef.current.rotation.y =
        pointer.current.x * 0.14 + Math.cos(t * 0.7) * 0.015;
      groupRef.current.position.y =
        (1 - intro) * -0.28 + breathRef.current * 0.45 + pointer.current.y * 0.08;
      groupRef.current.position.x = pointer.current.x * 0.14;
    }
  });

  return (
    <Float
      speed={reduceMotion ? 0 : 1.15}
      rotationIntensity={reduceMotion ? 0 : 0.06}
      floatIntensity={reduceMotion ? 0 : 0.14}
    >
      <group ref={groupRef}>
        <Center>
          <Text3D
            font="/fonts/pacifico_regular.typeface.json"
            size={0.82}
            height={0.42}
            curveSegments={16}
            bevelEnabled
            bevelThickness={0.2}
            bevelSize={0.12}
            bevelOffset={-0.015}
            bevelSegments={8}
            letterSpacing={0.015}
            lineHeight={0.95}
            onUpdate={(mesh) => {
              (mesh as Mesh).geometry.computeVertexNormals();
            }}
          >
            {`Welcome to\nJZ Enterprises`}
            <primitive object={material} attach="material" />
          </Text3D>
        </Center>
      </group>
    </Float>
  );
}

function PointerBridge({ pointer }: { readonly pointer: PointerState }) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const element = gl.domElement;

    const readPointer = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        pointer.active = 0;
        pointer.target.set(0, 0);
        invalidate();
        return;
      }

      const x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const y = -(((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      pointer.target.set(x, y);
      pointer.active = 1;
      invalidate();
    };

    const onMove = (event: PointerEvent) => {
      readPointer(event.clientX, event.clientY);
    };

    const onLeaveWindow = () => {
      pointer.active = 0;
      pointer.target.set(0, 0);
      invalidate();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeaveWindow);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeaveWindow);
    };
  }, [gl, invalidate, pointer]);

  return null;
}

function CursorAura({
  pointer,
  reduceMotion,
}: {
  readonly pointer: PointerState;
  readonly reduceMotion: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const intensityRef = useRef(0);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uIntensity: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uIntensity;
          uniform float uTime;
          void main() {
            vec2 p = vUv - 0.5;
            float d = length(p);
            float wave = 0.88 + 0.12 * sin(uTime * 2.4 + d * 14.0);
            float core = exp(-d * d * 22.0);
            float soft = exp(-d * d * 7.5);
            float halo = exp(-d * d * 2.4);
            vec3 brand = vec3(0.455, 0.506, 0.373);
            vec3 secondary = vec3(0.976, 0.631, 0.216);
            vec3 cream = vec3(0.969, 0.961, 0.941);
            vec3 col = mix(brand, secondary, soft);
            col = mix(col, cream, core);
            float alpha = (core * 1.15 + soft * 0.7 + halo * 0.35) * uIntensity * wave;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033);
    const target = reduceMotion ? 0 : pointer.active;
    intensityRef.current = MathUtils.damp(intensityRef.current, target, 6.5, dt);
    const intensity = material.uniforms.uIntensity;
    const time = material.uniforms.uTime;
    if (intensity && time) {
      intensity.value = intensityRef.current;
      time.value = state.clock.elapsedTime;
    }

    if (!meshRef.current) {
      return;
    }

    meshRef.current.position.set(
      pointer.current.x * 3.4,
      pointer.current.y * 1.9,
      1.15,
    );
    const size = 3.2 + intensityRef.current * 2.2 + pointer.velocity.length() * 1.1;
    meshRef.current.scale.setScalar(size);
    meshRef.current.visible = intensityRef.current > 0.01;
  });

  return (
    <mesh ref={meshRef} material={material} renderOrder={2}>
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}

function CursorLight({ pointer }: { readonly pointer: PointerState }) {
  const lightRef = useRef<PointLight>(null);
  const fillRef = useRef<PointLight>(null);

  useFrame(() => {
    const light = lightRef.current;
    const fill = fillRef.current;
    if (!light || !fill) {
      return;
    }

    const x = pointer.current.x * 3.2;
    const y = pointer.current.y * 1.8;
    light.position.set(x, y, 3.5);
    fill.position.set(x * 0.7, y * 0.7, 2.2);
    const boost = pointer.active * (2.8 + Math.min(2.2, pointer.velocity.length() * 8));
    light.intensity = 0.4 + boost;
    fill.intensity = 0.2 + boost * 0.55;
  });

  return (
    <>
      <pointLight
        ref={lightRef}
        color={colors.cream}
        intensity={0.4}
        distance={10}
        decay={2}
      />
      <pointLight
        ref={fillRef}
        color={colors.secondary}
        intensity={0.2}
        distance={8}
        decay={2}
      />
    </>
  );
}

function Scene({
  reduceMotion,
  shellRef,
}: {
  readonly reduceMotion: boolean;
  readonly shellRef: RefObject<HTMLDivElement | null>;
}) {
  const pointer = useMemo(() => createPointer(), []);

  return (
    <>
      <ambientLight intensity={0.32} color={colors.brand} />
      <directionalLight
        position={[4.5, 7, 5]}
        intensity={1.15}
        color={colors.cream}
      />
      <directionalLight
        position={[-5, 2, -2.5]}
        intensity={0.85}
        color={colors.brand}
      />
      <spotLight
        position={[0, 6.5, 4.5]}
        angle={0.5}
        penumbra={0.8}
        intensity={1.35}
        color={colors.secondary}
      />
      <pointLight
        position={[2.8, 0.8, 2.8]}
        intensity={1.1}
        color={colors.secondary}
      />
      <pointLight
        position={[-2.4, -0.4, 2.2]}
        intensity={0.55}
        color={colors.brand}
      />
      <CursorLight pointer={pointer} />
      <CursorAura pointer={pointer} reduceMotion={reduceMotion} />
      <PointerBridge pointer={pointer} />
      <Environment
        files="/hdri/studio_small_03_1k.hdr"
        environmentIntensity={0.42}
      />
      <BalloonWelcome
        pointer={pointer}
        reduceMotion={reduceMotion}
        shellRef={shellRef}
      />
      <ContactShadows
        position={[0, -1.75, 0]}
        opacity={0.3}
        scale={14}
        blur={3}
        far={5}
        color="#050705"
        frames={1}
      />
    </>
  );
}

export function WelcomeHero3D({
  active = true,
}: {
  readonly active?: boolean;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <div
      ref={shellRef}
      className="absolute inset-0 z-10"
      role="img"
      aria-label="Welcome to JZ Enterprises"
      style={{ opacity: reduceMotion ? 1 : 0.35 }}
    >
      <Canvas
        className="h-full w-full touch-none bg-transparent"
        dpr={[1, 1.25]}
        camera={{ position: [0, 0.05, 7.6], fov: 38, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMappingExposure: 0.95,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <Scene reduceMotion={reduceMotion} shellRef={shellRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
