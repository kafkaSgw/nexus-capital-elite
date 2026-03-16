// @ts-nocheck — react-force-graph-2d and d3-force lack type declarations
'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import * as d3 from 'd3-force';

interface Node {
    id: string;
    name: string;
    isMain?: boolean;
    expanded?: boolean;
    color?: string;
    val?: number;
}

interface Link {
    source: string;
    target: string;
    isNew?: boolean;
}

export default function WikiGraph({
    graphData,
    onNodeClick
}: {
    graphData: { nodes: Node[], links: Link[] },
    onNodeClick: (node: Node) => void
}) {
    const fgRef = useRef<ForceGraphMethods>();
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        // Update size on mount
        setWindowSize({ width: window.innerWidth, height: window.innerHeight - 150 });

        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight - 150 });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Agressive physics for a clean radial DAG mind-map
        if (fgRef.current) {
            // Increase repulsion enormously
            fgRef.current.d3Force('charge')?.strength(-2500); // Massive repel

            // Push layers much farther apart
            fgRef.current.d3Force('link')?.distance(300);

            // Dynamically calculate collision radius based on text length to prevent overlap
            // A node with a long name gets a larger force field
            fgRef.current.d3Force('collide', d3.forceCollide().radius((node: any) => {
                const textLen = node.name ? node.name.length : 10;
                // Base radius 20 + approx 5 pixels per character
                return 20 + textLen * 5;
            }).iterations(3));

            fgRef.current.d3Force('center')?.strength(0.01);

            // Auto-zoom to fit when data changes significantly
            setTimeout(() => {
                fgRef.current?.zoomToFit(800, 50);
            }, 600);
        }
    }, [graphData.nodes.length]);

    const handleNodeClick = useCallback((node: any) => {
        // Center view on the node clicked
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 800);
            fgRef.current.zoom(2.5, 800);
        }
        // Propagate up
        onNodeClick(node);
    }, [onNodeClick]);

    return (
        <div className="w-full h-full relative cursor-crosshair">
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeId="id"
                nodeLabel="name"
                width={windowSize.width}
                height={windowSize.height}

                // Mapeamento Mental (DAG)
                dagMode="radialout"
                dagLevelDistance={350} // Ensure parent-child distance allows the massive text spacing

                // Styling Nodes
                nodeColor={(node: any) => {
                    if (node.isMain) return '#eab308'; // Amber for root
                    if (node.expanded) return '#3b82f6'; // Blue for explored nodes
                    return '#64748b'; // Slate for unexplored children
                }}
                nodeRelSize={4}
                nodeVal={(node: any) => node.isMain ? 12 : node.expanded ? 8 : 4}
                // Styling Links
                linkColor={(link: any) => link.isNew ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="transparent"
                enableNodeDrag={true}
                enableZoomInteraction={true}
                onNodeClick={handleNodeClick}

                // Custom draw for beautiful aesthetic nodes without the "Sun" mess
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const isMain = node.isMain;
                    const isExpanded = node.expanded;

                    const fontSize = isMain ? 16 / globalScale : 11 / globalScale;
                    ctx.font = `${isMain ? 'bold' : 'normal'} ${fontSize}px Inter, sans-serif`;

                    const nodeRadius = isMain ? 10 : isExpanded ? 7 : 5;
                    const color = isMain ? '#eab308' : isExpanded ? '#3b82f6' : '#64748b';

                    // Draw solid node
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = color;
                    ctx.fill();

                    // Draw subtle outline
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1 / globalScale;
                    ctx.stroke();

                    // Draw Label Text directly (Clean style)
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    // Subtle Label background
                    ctx.fillStyle = 'rgba(2, 2, 5, 0.7)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + nodeRadius + 3, bckgDimensions[0], bckgDimensions[1]);

                    // Text
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isMain ? '#fef08a' : '#f8fafc';
                    ctx.fillText(label, node.x, node.y + nodeRadius + 3 + (bckgDimensions[1] / 2));
                }}
            />
        </div>
    );
}
