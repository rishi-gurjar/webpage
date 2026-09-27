"use client";

import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { FACES } from "./gothicFaces";
import styles from "./GothicText.module.css";

const JACQUARD_INDEX = 0;

type FaceMap = Record<string, number>;

type Cycle = (id: string, x: number, y: number) => void;

function randomOtherFace(current: number) {
  const pool = FACES.map((_, index) => index).filter(
    (index) => index !== JACQUARD_INDEX && index !== current
  );
  return pool[Math.floor(Math.random() * pool.length)];
}

const NEIGHBOR_REACH = 64;
const LINE_REACH = 220;
const HALF = 9000;

function chaosSpeed(elapsed: number) {
  if (elapsed >= HALF * 2) return 0;
  const u = elapsed <= HALF ? elapsed / HALF : 1 - (elapsed - HALF) / HALF;
  return u * u;
}

function flipPace(elapsed: number) {
  return 36 / Math.max(chaosSpeed(elapsed) ** 2, 0.045);
}

function glyphsNear(id: string, reach: number) {
  const glyphs = [...document.querySelectorAll<HTMLElement>("[data-glyph]")];
  const origin = glyphs.find((glyph) => glyph.dataset.glyph === id);
  if (!origin) return [];

  const originBox = origin.getBoundingClientRect();
  const originX = originBox.left + originBox.width / 2;
  const originY = originBox.top + originBox.height / 2;

  return glyphs
    .filter((glyph) => glyph !== origin)
    .map((glyph) => {
      const box = glyph.getBoundingClientRect();
      const dx = box.left + box.width / 2 - originX;
      const dy = box.top + box.height / 2 - originY;
      return {
        id: glyph.dataset.glyph as string,
        dx,
        dy,
        dist: Math.hypot(dx, dy),
      };
    })
    .filter((glyph) => glyph.dist > 0 && glyph.dist <= reach);
}

function glyphNeighborIds(id: string) {
  const nearest: ({ id: string; dist: number } | undefined)[] = [];
  const consider = (glyph: { id: string; dx: number; dy: number; dist: number }) => {
    const sector = (Math.round(Math.atan2(glyph.dy, glyph.dx) / (Math.PI / 4)) + 8) % 8;
    const current = nearest[sector];
    if (!current || glyph.dist < current.dist) nearest[sector] = glyph;
  };

  for (const glyph of glyphsNear(id, NEIGHBOR_REACH)) consider(glyph);
  for (const glyph of glyphsNear(id, LINE_REACH)) {
    const sector = (Math.round(Math.atan2(glyph.dy, glyph.dx) / (Math.PI / 4)) + 8) % 8;
    if (!nearest[sector]) consider(glyph);
  }

  return nearest.flatMap((entry) => (entry ? [entry.id] : []));
}

function splitText(text: string, path: string, faces: FaceMap, cycle: Cycle) {
  return Array.from(text).map((char, index) => {
    if (/\s/.test(char)) return char;

    const id = `${path}:${index}`;
    const active = faces[id];
    const shown = active ?? JACQUARD_INDEX;

    return (
      <span
        key={id}
        data-glyph={id}
        className={cn(styles.glyph, active !== undefined && styles.locked)}
        style={{ ["--glyph-font" as string]: FACES[shown].family }}
        onPointerEnter={(event) => cycle(id, event.clientX, event.clientY)}
      >
        {char}
      </span>
    );
  });
}

function transform(
  node: ReactNode,
  path: string,
  faces: FaceMap,
  cycle: Cycle
): ReactNode {
  return Children.map(node, (child, index) => {
    const childPath = `${path}.${index}`;

    if (typeof child === "string" || typeof child === "number") {
      return (
        <Fragment key={childPath}>
          {splitText(String(child), childPath, faces, cycle)}
        </Fragment>
      );
    }

    if (!isValidElement(child)) return child;

    const element = child as ReactElement<{
      children?: ReactNode;
      dangerouslySetInnerHTML?: unknown;
    }>;

    if (element.props.dangerouslySetInnerHTML || element.props.children == null) {
      return child;
    }

    return cloneElement(
      element,
      undefined,
      transform(element.props.children, childPath, faces, cycle)
    );
  });
}

export function GothicText({ children }: { children: ReactNode }) {
  const [faces, setFaces] = useState<FaceMap>({});
  const facesRef = useRef<FaceMap>({});
  const lastHover = useRef<Record<string, number>>({});
  const generationRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const pointerRef = useRef({ x: 0, y: 0 });
  const dueRef = useRef<Record<string, number>>({});
  const bornRef = useRef<Record<string, number>>({});
  const evolutionRef = useRef<number | null>(null);
  const ignitedAtRef = useRef(0);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (evolutionRef.current !== null) window.clearTimeout(evolutionRef.current);
    };
  }, []);

  const arm = (id: string, now: number) => {
    bornRef.current[id] = now;
    dueRef.current[id] = now + flipPace(0) * (1 + Math.random() * 0.6);
  };

  const writeFace = (id: string, face: number) => {
    if (bornRef.current[id] == null) arm(id, performance.now());
    const updated = { ...facesRef.current, [id]: face };
    facesRef.current = updated;
    setFaces(updated);
  };

  const startEvolution = () => {
    if (evolutionRef.current !== null) return;

    const step = () => {
      const now = performance.now();
      const updated = { ...facesRef.current };
      const ids = Object.keys(updated);

      if (ids.length === 0) {
        facesRef.current = {};
        dueRef.current = {};
        bornRef.current = {};
        setFaces({});
        evolutionRef.current = null;
        return;
      }

      let changed = false;

      for (const id of ids) {
        if ((dueRef.current[id] ?? Infinity) > now) continue;
        const elapsed = now - (bornRef.current[id] ?? ignitedAtRef.current);
        const speed = chaosSpeed(elapsed);
        const settle =
          elapsed > HALF && speed < 0.22 ? ((0.22 - speed) / 0.22) ** 2 : 0;
        changed = true;
        if (Math.random() < settle) {
          delete updated[id];
          delete dueRef.current[id];
          delete bornRef.current[id];
          continue;
        }
        updated[id] = randomOtherFace(updated[id]);
        dueRef.current[id] = now + flipPace(elapsed) * (0.45 + Math.random() * 1.2);
      }

      if (changed) {
        facesRef.current = updated;
        setFaces(updated);
      }
      evolutionRef.current = window.setTimeout(step, 40);
    };

    evolutionRef.current = window.setTimeout(step, 40);
  };

  const queueSpread = (id: string, face: number, generation: number) => {
    glyphNeighborIds(id).forEach((neighborId, index) => {
      if (seenRef.current.has(neighborId)) return;
      seenRef.current.add(neighborId);
      const born = bornRef.current[id] ?? performance.now();
      const delay = flipPace(0) * (1.8 + index * 1.05 + Math.random() * 0.35);
      const timer = window.setTimeout(() => {
        if (generationRef.current !== generation) return;
        if (performance.now() - born >= HALF * 2) return;
        const nextFace = Math.random() < 0.38 ? randomOtherFace(face) : face;
        writeFace(neighborId, nextFace);
        queueSpread(neighborId, nextFace, generation);
      }, delay);
      timersRef.current.push(timer);
    });
  };

  const cycle = (id: string, x: number, y: number) => {
    const now = performance.now();
    if (now - (lastHover.current[id] ?? 0) < 160) return;
    const travel = Math.hypot(x - pointerRef.current.x, y - pointerRef.current.y);
    pointerRef.current = { x, y };
    lastHover.current[id] = now;

    const running =
      evolutionRef.current !== null || Object.keys(facesRef.current).length > 0;
    if (running) {
      if (bornRef.current[id] == null && travel >= 12) {
        writeFace(id, JACQUARD_INDEX);
        queueSpread(id, JACQUARD_INDEX, generationRef.current);
      }
      return;
    }

    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    seenRef.current = new Set([id]);
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    ignitedAtRef.current = now;

    const previous = facesRef.current[id];
    const next =
      previous === undefined ? JACQUARD_INDEX : randomOtherFace(previous);
    writeFace(id, next);
    queueSpread(id, next, generation);
    startEvolution();
  };

  return (
    <div
      className={cn(
        styles.root,
        FACES.flatMap((entry) => ("face" in entry ? [entry.face.variable] : []))
      )}
    >
      {transform(children, "t", faces, cycle)}
    </div>
  );
}
