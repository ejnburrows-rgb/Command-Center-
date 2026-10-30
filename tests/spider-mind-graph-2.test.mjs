import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("Interactive Mind Graph 2.0 keyframes and classes exist in app/globals.css", () => {
  const css = read("app/globals.css");
  assert.match(css, /@keyframes spiderNodeEnter/);
  assert.match(css, /@keyframes spiderEdgeEnter/);
  assert.match(css, /@keyframes is-zoom-fitting-pulse/);
  assert.match(css, /@keyframes spiderNodeClickBounce/);
  assert.match(css, /\.spider-camera-group/);
  assert.match(css, /\.spider-camera-group\.is-zoom-fitting/);
  assert.match(css, /\.spider-node-inner/);
  assert.match(css, /\.spider-node-inner\.is-dragging/);
  assert.match(css, /\.spider-node-inner\.is-bouncing/);
  assert.match(css, /\.spider-node-inner \.spider-node-border/);
  assert.match(css, /\.spider-node-inner \.spider-node-tooltip/);
  assert.match(css, /\.spider-edge-line/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  // Lineage tracing and collapse toggle
  assert.match(css, /\.spider-node-toggle/);
  assert.match(css, /\.spider-node-inner\.is-dimmed/);
  assert.match(css, /\.spider-node-inner\.is-path-highlighted/);
  assert.match(css, /\.spider-edge-line\.is-dimmed/);
  assert.match(css, /\.spider-edge-line\.is-path-highlighted/);
});

test("MissionNetwork implements camera transitions, zoom-to-fit pulse, hover tooltips, click bounce, and drag-and-drop", () => {
  const net = read("app/mission-network.tsx");
  assert.match(net, /spider-camera-group/);
  assert.match(net, /is-zoom-fitting/);
  assert.match(net, /spider-node-inner/);
  assert.match(net, /spider-node-border/);
  assert.match(net, /spider-node-tooltip/);
  assert.match(net, /spider-edge-line/);
  assert.match(net, /is-bouncing/);
  assert.match(net, /is-dragging/);
  assert.match(net, /is-selected/);
  assert.match(net, /handleZoomToFit/);
  assert.match(net, /triggerBounce/);
  assert.match(net, /handleNodePointerDown/);
  assert.match(net, /handleNodePointerMove/);
  assert.match(net, /handleNodePointerUp/);
  assert.match(net, /resetLayout/);
  assert.match(net, /Fit 🎯/);

  // Toggle icon and path highlight lineage
  assert.match(net, /spider-node-toggle/);
  assert.match(net, /toggleCollapse/);
  assert.match(net, /getCartillaRootPath/);
  assert.match(net, /getHiddenDescendants/);
  assert.match(net, /setHoveredNodeId/);
  assert.match(net, /is-path-highlighted/);
  assert.match(net, /is-dimmed/);
  assert.match(net, /Expand All ⊞/);
});
