import React from 'react';

function RoadSurface({ id, position, rotation = [-Math.PI / 2, 0, 0], width = 8, length = 120, color = '#2f2f2f' }) {
  return (
    <mesh name={id} userData={{ id }} position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function RoadGrid({
  roadWidth = 8,
  mainLength = 160,
  crossLength = 100,
  center = [0, 0.01, -20],
  dash = { size: 2, gap: 3 },
}) {
  const [cx, cy, cz] = center;

  // No center dashes

  return (
    <group name="road-grid" userData={{ id: 'road-grid' }}>
      {/* Ground */}
      <mesh name="ground" userData={{ id: 'ground' }} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* Main N-S road (along Z axis) */}
      <RoadSurface id="road-main" position={[cx, cy, cz]} width={roadWidth} length={mainLength} />

      {/* Removed cross and parallel roads to avoid center artifacts */}

      {/* No center dashed lane markings or intersection pad */}

      {/* Edge lines for main road */}
      <mesh name="edge-main-left" userData={{ id: 'edge-main-left', ignoreGround: true }} position={[cx - roadWidth/2 + 0.2, cy + 0.002, cz]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.1, mainLength]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh name="edge-main-right" userData={{ id: 'edge-main-right', ignoreGround: true }} position={[cx + roadWidth/2 - 0.2, cy + 0.002, cz]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.1, mainLength]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* No cross-road edge lines */}
    </group>
  );
}
