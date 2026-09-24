"use client";

import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
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

type Cycle = (id: string) => void;

function randomOtherFace(current: number) {
  const pool = FACES.map((_, index) => index).filter(
    (index) => index !== JACQUARD_INDEX && index !== current
  );
  return pool[Math.floor(Math.random() * pool.length)];
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
        className={cn(styles.glyph, active !== undefined && styles.locked)}
        style={{ ["--glyph-font" as string]: FACES[shown].family }}
        onPointerEnter={() => cycle(id)}
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

  const cycle = (id: string) => {
    const now = performance.now();
    if (now - (lastHover.current[id] ?? 0) < 160) return;
    lastHover.current[id] = now;

    const previous = facesRef.current[id];
    const next =
      previous === undefined ? JACQUARD_INDEX : randomOtherFace(previous);
    const updated = { ...facesRef.current, [id]: next };
    facesRef.current = updated;
    setFaces(updated);
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
