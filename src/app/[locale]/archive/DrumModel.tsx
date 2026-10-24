'use client';

/**
 * 铜鼓三维模型
 * Bronze drum 3D model
 *
 * 说明：这是**程序化生成的示意模型**，用于展示鼓面同心纹与鼓身收腰的形体关系，
 * 不是对某件馆藏文物的实测扫描，不能作为形制研究的依据（版权页与关于页均已注明）。
 *
 * 技术选择：直接使用 three.js 而非 react-three-fiber —— 只需要一个不随应用状态变化的
 * 静态场景，原生 three 更小、更可控，也不会把 R3F 的 reconciler 打进首屏包。
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface DrumModelHandle {
  reset: () => void;
  toggleSpin: () => void;
  snapshot: () => string | null;
  /** 键盘替代操作：按角度旋转（弧度） */
  rotateBy: (radians: number) => void;
  /** 键盘替代操作：缩放（倍率增量） */
  zoomBy: (delta: number) => void;
}

export default function DrumModel({
  onReady,
  label,
  hint,
}: {
  onReady?: (handle: DrumModelHandle) => void;
  label: string;
  hint: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<DrumModelHandle | null>(null);
  const [spinning, setSpinning] = useState(true);
  const draggingRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const width = host.clientWidth || 480;
    const height = host.clientHeight || 420;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 5.4);
    camera.lookAt(0, 0, 0);

    // 光线：主光偏右上，补光偏左下，模拟展柜射灯
    const key = new THREE.DirectionalLight(0xfff3d0, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.9);
    fill.position.set(-4, -1, -3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const bronze = new THREE.MeshStandardMaterial({
      color: 0x8c6a3f,
      metalness: 0.85,
      roughness: 0.38,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.25,
    });

    const drum = new THREE.Group();

    // 鼓面（略呈浅穹顶）
    const face = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.12, 96), bronze);
    face.position.y = 0.62;
    drum.add(face);

    // 鼓身：上宽下窄的收腰
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.15, 1.18, 96, 1, true), bronze);
    body.position.y = 0;
    drum.add(body);

    // 鼓底
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.1, 96), bronze);
    base.position.y = -0.62;
    drum.add(base);

    // 太阳芒纹：中心圆 + 12 道芒线
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 48), gold);
    hub.position.y = 0.69;
    drum.add(hub);

    for (let i = 0; i < 12; i += 1) {
      const ray = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.62), gold);
      ray.position.set(0, 0.69, 0);
      ray.rotation.y = (i * Math.PI) / 6;
      ray.position.x = Math.sin((i * Math.PI) / 6) * 0.62;
      ray.position.z = Math.cos((i * Math.PI) / 6) * 0.62;
      drum.add(ray);
    }

    // 同心弦纹
    [0.85, 1.05, 1.25, 1.45].forEach((r) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 96), gold);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.69;
      drum.add(ring);
    });

    // 鼓面边缘四只蛙饰（示意：简化几何体）
    for (let i = 0; i < 4; i += 1) {
      const frog = new THREE.Group();
      const bodyF = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), bronze);
      bodyF.scale.set(1.4, 0.7, 1);
      frog.add(bodyF);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), bronze);
      head.position.set(0, 0.03, 0.14);
      frog.add(head);
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      frog.position.set(Math.sin(angle) * 1.42, 0.7, Math.cos(angle) * 1.42);
      frog.rotation.y = angle;
      drum.add(frog);
    }

    // 鼓身腰线
    [-0.42, 0, 0.42].forEach((y) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.34, 0.02, 8, 96), gold);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      drum.add(ring);
    });

    drum.rotation.x = 0.22;
    scene.add(drum);

    let raf = 0;
    let last = 0;
    const spinningRef = { current: true };
    const animate = (t: number) => {
      raf = window.requestAnimationFrame(animate);
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      if (spinningRef.current && !draggingRef.current) {
        drum.rotation.y += dt * 0.6;
      }
      renderer.render(scene, camera);
    };
    raf = window.requestAnimationFrame(animate);

    // 拖拽旋转 + 滚轮缩放（键盘用户用按钮替代，见下方控制条）
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      drum.rotation.y += dx * 0.01;
      drum.rotation.x = THREE.MathUtils.clamp(drum.rotation.x + dy * 0.006, -0.5, 0.9);
    };
    const onUp = (e: PointerEvent) => {
      draggingRef.current = false;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.002, 3.4, 8.5);
    };

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // 尺寸变化时重算宽高比（对话框 / 响应式布局都会触发）
    const observer = new ResizeObserver(() => {
      const w = host.clientWidth || width;
      const h = host.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    observer.observe(host);

    handleRef.current = {
      reset: () => {
        drum.rotation.set(0.22, 0, 0);
        camera.position.set(0, 2.4, 5.4);
        camera.lookAt(0, 0, 0);
      },
      toggleSpin: () => {
        spinningRef.current = !spinningRef.current;
        setSpinning(spinningRef.current);
      },
      snapshot: () => {
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL('image/png');
      },
      rotateBy: (radians: number) => {
        // 手动旋转时必须先停掉自转，否则动画循环每帧 +0.6rad/s 会立刻盖掉这一步，
        // 左右两个按钮看起来就都朝同一个方向（逆时针）转。
        spinningRef.current = false;
        setSpinning(false);
        drum.rotation.y += radians;
        renderer.render(scene, camera);
      },
      zoomBy: (delta: number) => {
        camera.position.z = THREE.MathUtils.clamp(camera.position.z + delta, 3.4, 8.5);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      },
    };
    onReady?.(handleRef.current);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
    // 仅在挂载时初始化一次；onReady 由父组件用 useCallback 固定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 父组件有时在模型挂载后才渲染控制条，这里保证句柄可用
  useEffect(() => {
    if (handleRef.current) onReady?.(handleRef.current);
  }, [onReady]);

  return (
    <div className="relative w-full h-full min-h-[320px]">
      <div ref={hostRef} className="w-full h-full" role="img" aria-label={label} />
      <p className="absolute left-3 bottom-3 text-xs text-white/80 bg-black/40 rounded px-2 py-1 pointer-events-none">
        {hint}
      </p>
      <span className="sr-only" aria-live="polite">
        {spinning ? 'rotating' : 'paused'}
      </span>
    </div>
  );
}
