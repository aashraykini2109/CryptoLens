import {
  ReactFlow,
  Controls,
  Background,
  Handle,
  Position,
  useViewport,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";


// =====================================================
// CUSTOM CRYPTO NODE
// =====================================================

function CryptoNode({ data }) {
  return (
    <div
      style={{
        background: "#111827",
        border: `1px solid ${data.color}`,
        borderRadius: "10px",
        padding: "12px 18px",
        minWidth: "130px",
        textAlign: "center",
        color: "#ffffff",
        boxShadow: `0 0 12px ${data.color}33`,
      }}
    >
      {data.type !== "project" && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: data.color,
            width: 7,
            height: 7,
            border: "none",
          }}
        />
      )}

      <div
        style={{
          fontSize: "15px",
          fontWeight: "600",
        }}
      >
        {data.label}
      </div>

      {data.subtitle && (
        <div
          style={{
            marginTop: "5px",
            fontSize: "11px",
            color: data.color,
          }}
        >
          {data.subtitle}
        </div>
      )}

      {data.type !== "algorithm" && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: data.color,
            width: 7,
            height: 7,
            border: "none",
          }}
        />
      )}
    </div>
  );
}


// =====================================================
// CUSTOM MINIMAP
// =====================================================

function CustomMiniMap() {
  const { x, y, zoom } = useViewport();
  const { setCenter } = useReactFlow();

  const minimapWidth = 180;
  const minimapHeight = 125;

  /*
    These represent the complete graph coordinate space.
    Your nodes occupy approximately this area.
  */
  const graphWidth = 1000;
  const graphHeight = 430;

  const graphMinX = 0;
  const graphMinY = 0;

  const scaleX = minimapWidth / graphWidth;
  const scaleY = minimapHeight / graphHeight;

  const scale = Math.min(scaleX, scaleY);

  const offsetX =
    (minimapWidth - graphWidth * scale) / 2;

  const offsetY =
    (minimapHeight - graphHeight * scale) / 2;


  // -----------------------------------------------
  // Nodes displayed inside our MiniMap
  // -----------------------------------------------

  const miniNodes = [
    {
      id: "project",
      x: 420,
      y: 20,
      width: 150,
      height: 65,
      color: "#e5e7eb",
    },

    {
      id: "hashing",
      x: 80,
      y: 150,
      width: 150,
      height: 65,
      color: "#a855f7",
    },

    {
      id: "symmetric",
      x: 390,
      y: 150,
      width: 180,
      height: 65,
      color: "#3b82f6",
    },

    {
      id: "asymmetric",
      x: 720,
      y: 150,
      width: 190,
      height: 65,
      color: "#22c55e",
    },

    {
      id: "md5",
      x: 20,
      y: 320,
      width: 140,
      height: 65,
      color: "#ef4444",
    },

    {
      id: "sha1",
      x: 180,
      y: 320,
      width: 140,
      height: 65,
      color: "#ef4444",
    },

    {
      id: "sha256",
      x: 340,
      y: 320,
      width: 140,
      height: 65,
      color: "#22c55e",
    },

    {
      id: "aes",
      x: 500,
      y: 320,
      width: 140,
      height: 65,
      color: "#22c55e",
    },

    {
      id: "des",
      x: 650,
      y: 320,
      width: 140,
      height: 65,
      color: "#ef4444",
    },

    {
      id: "rsa",
      x: 800,
      y: 320,
      width: 140,
      height: 65,
      color: "#f59e0b",
    },
  ];


  // -----------------------------------------------
  // Convert graph coordinates → MiniMap coordinates
  // -----------------------------------------------

  const toMiniX = (value) =>
    offsetX + value * scale;

  const toMiniY = (value) =>
    offsetY + value * scale;


  // -----------------------------------------------
  // Current visible area
  //
  // React Flow viewport:
  //
  // screen = graph * zoom + x
  //
  // therefore:
  //
  // graphLeft = -x / zoom
  // graphTop  = -y / zoom
  // -----------------------------------------------

  const mapElement =
    document.querySelector(".crypto-map");

  const viewportWidth =
    mapElement?.clientWidth || 900;

  const viewportHeight =
    mapElement?.clientHeight || 500;

  const visibleLeft = -x / zoom;
  const visibleTop = -y / zoom;

  const visibleWidth =
    viewportWidth / zoom;

  const visibleHeight =
    viewportHeight / zoom;


  const viewportLeft =
    toMiniX(visibleLeft);

  const viewportTop =
    toMiniY(visibleTop);

  const viewportMiniWidth =
    visibleWidth * scale;

  const viewportMiniHeight =
    visibleHeight * scale;


  // -----------------------------------------------
  // Click MiniMap → move main map
  // -----------------------------------------------

  const handleMiniMapClick = (event) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const clickX =
      event.clientX - rect.left;

    const clickY =
      event.clientY - rect.top;

    const graphX =
      (clickX - offsetX) / scale;

    const graphY =
      (clickY - offsetY) / scale;

    setCenter(
      graphX,
      graphY,
      {
        zoom,
        duration: 400,
      }
    );
  };


  return (
    <div
      className="custom-minimap"
      onClick={handleMiniMapClick}
    >

      {/* ======================================
          GRAPH NODES
      ====================================== */}

      {miniNodes.map((node) => (
        <div
          key={node.id}
          className="mini-node"
          style={{
            left: toMiniX(node.x),
            top: toMiniY(node.y),
            width: node.width * scale,
            height: node.height * scale,
            background: node.color,
            borderColor: node.color,
          }}
        />
      ))}


      {/* ======================================
          CURRENT VIEWPORT
      ====================================== */}

      <div
        className="mini-viewport"
        style={{
          left: viewportLeft,
          top: viewportTop,
          width: Math.max(viewportMiniWidth, 20),
          height: Math.max(viewportMiniHeight, 20),
        }}
      />
    </div>
  );
}


// =====================================================
// NODE TYPES
// =====================================================

const nodeTypes = {
  crypto: CryptoNode,
};


// =====================================================
// MAIN NODES
// =====================================================

const nodes = [

  // PROJECT
  {
    id: "project",
    type: "crypto",
    position: {
      x: 420,
      y: 20,
    },
    data: {
      label: "🔐 My Project",
      subtitle: "Cryptographic Usage",
      color: "#e5e7eb",
      type: "project",
    },
  },


  // CATEGORIES
  {
    id: "hashing",
    type: "crypto",
    position: {
      x: 80,
      y: 150,
    },
    data: {
      label: "Hashing",
      subtitle: "3 algorithms",
      color: "#a855f7",
      type: "category",
    },
  },

  {
    id: "symmetric",
    type: "crypto",
    position: {
      x: 390,
      y: 150,
    },
    data: {
      label: "Symmetric Encryption",
      subtitle: "2 algorithms",
      color: "#3b82f6",
      type: "category",
    },
  },

  {
    id: "asymmetric",
    type: "crypto",
    position: {
      x: 720,
      y: 150,
    },
    data: {
      label: "Asymmetric Cryptography",
      subtitle: "1 algorithm",
      color: "#22c55e",
      type: "category",
    },
  },


  // ALGORITHMS
  {
    id: "md5",
    type: "crypto",
    position: {
      x: 20,
      y: 320,
    },
    data: {
      label: "MD5",
      subtitle: "HIGH RISK",
      color: "#ef4444",
      type: "algorithm",
    },
  },

  {
    id: "sha1",
    type: "crypto",
    position: {
      x: 180,
      y: 320,
    },
    data: {
      label: "SHA-1",
      subtitle: "HIGH RISK",
      color: "#ef4444",
      type: "algorithm",
    },
  },

  {
    id: "sha256",
    type: "crypto",
    position: {
      x: 340,
      y: 320,
    },
    data: {
      label: "SHA-256",
      subtitle: "LOW RISK",
      color: "#22c55e",
      type: "algorithm",
    },
  },

  {
    id: "aes",
    type: "crypto",
    position: {
      x: 500,
      y: 320,
    },
    data: {
      label: "AES",
      subtitle: "LOW RISK",
      color: "#22c55e",
      type: "algorithm",
    },
  },

  {
    id: "des",
    type: "crypto",
    position: {
      x: 650,
      y: 320,
    },
    data: {
      label: "DES",
      subtitle: "HIGH RISK",
      color: "#ef4444",
      type: "algorithm",
    },
  },

  {
    id: "rsa",
    type: "crypto",
    position: {
      x: 800,
      y: 320,
    },
    data: {
      label: "RSA",
      subtitle: "MEDIUM RISK",
      color: "#f59e0b",
      type: "algorithm",
    },
  },
];


// =====================================================
// EDGES
// =====================================================

const edges = [

  {
    id: "project-hashing",
    source: "project",
    target: "hashing",
    animated: true,
    style: {
      stroke: "#a855f7",
      strokeWidth: 1.5,
    },
  },

  {
    id: "project-symmetric",
    source: "project",
    target: "symmetric",
    animated: true,
    style: {
      stroke: "#3b82f6",
      strokeWidth: 1.5,
    },
  },

  {
    id: "project-asymmetric",
    source: "project",
    target: "asymmetric",
    animated: true,
    style: {
      stroke: "#22c55e",
      strokeWidth: 1.5,
    },
  },


  // HASHING

  {
    id: "hashing-md5",
    source: "hashing",
    target: "md5",
    style: {
      stroke: "#ef4444",
      strokeWidth: 1.5,
    },
  },

  {
    id: "hashing-sha1",
    source: "hashing",
    target: "sha1",
    style: {
      stroke: "#ef4444",
      strokeWidth: 1.5,
    },
  },

  {
    id: "hashing-sha256",
    source: "hashing",
    target: "sha256",
    style: {
      stroke: "#22c55e",
      strokeWidth: 1.5,
    },
  },


  // SYMMETRIC

  {
    id: "symmetric-aes",
    source: "symmetric",
    target: "aes",
    style: {
      stroke: "#22c55e",
      strokeWidth: 1.5,
    },
  },

  {
    id: "symmetric-des",
    source: "symmetric",
    target: "des",
    style: {
      stroke: "#ef4444",
      strokeWidth: 1.5,
    },
  },


  // ASYMMETRIC

  {
    id: "asymmetric-rsa",
    source: "asymmetric",
    target: "rsa",
    style: {
      stroke: "#f59e0b",
      strokeWidth: 1.5,
    },
  },
];


// =====================================================
// COMPONENT
// =====================================================

function CryptoHealthMap() {
  return (
    <div className="crypto-map">

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        minZoom={0.4}
        maxZoom={2}
      >

        <Background
          color="#334155"
          gap={16}
          size={1}
        />

        <Controls />

        {/* OUR CUSTOM MINIMAP */}
        <CustomMiniMap />

      </ReactFlow>

    </div>
  );
}

export default CryptoHealthMap;