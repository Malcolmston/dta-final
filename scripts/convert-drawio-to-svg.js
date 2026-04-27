#!/usr/bin/env node

/**
 * Convert drawio XML to SVG
 */

const fs = require('fs');
const path = require('path');

function parseDrawioToSvg(inputPath, outputPath) {
  const xml = fs.readFileSync(inputPath, 'utf-8');

  // Extract diagram content
  const diagramMatch = xml.match(/<diagram[^>]*>([\s\S]*?)<\/diagram>/);
  if (!diagramMatch) {
    throw new Error('Could not find diagram in drawio file');
  }

  const diagramXml = diagramMatch[1];

  // Extract graph model attributes
  const modelMatch = diagramXml.match(/<mxGraphModel([^>]*)>/);
  const modelAttrs = modelMatch ? modelMatch[1] : '';

  // Parse dimensions
  const dx = parseInt(modelMatch ? modelAttrs.match(/dx="(\d+)"/)?.[1] || '1400' : '1400');
  const dy = parseInt(modelMatch ? modelAttrs.match(/dy="(\d+)"/)?.[1] || '900' : '900');
  const pageWidth = parseInt(modelMatch ? modelAttrs.match(/pageWidth="(\d+)"/)?.[1] || '1400' : '1400');
  const pageHeight = parseInt(modelMatch ? modelAttrs.match(/pageHeight="(\d+)"/)?.[1] || '1000' : '1000');

  // Extract all cells
  const cellRegex = /<mxCell\s+([^>]*)\/?>/g;
  const cells = [];
  let match;

  while ((match = cellRegex.exec(diagramXml)) !== null) {
    const attrs = match[1];
    const id = attrs.match(/id="([^"]*)"/)?.[1];
    const value = attrs.match(/value="([^"]*)"/)?.[1] || '';
    const style = attrs.match(/style="([^"]*)"/)?.[1] || '';
    const vertex = attrs.includes('vertex="1"');
    const parent = attrs.includes('parent="1"') || attrs.includes('parent="0"');

    // Parse geometry
    const geoMatch = diagramXml.substring(match.index).match(/<mxGeometry\s+([^>]*)\/>/);
    let geometry = {};
    if (geoMatch) {
      const geoAttrs = geoMatch[1];
      geometry = {
        x: parseInt(geoAttrs.match(/x="([^"]*)"/)?.[1] || '0'),
        y: parseInt(geoAttrs.match(/y="([^"]*)"/)?.[1] || '0'),
        width: parseInt(geoAttrs.match(/width="([^"]*)"/)?.[1] || '0'),
        height: parseInt(geoAttrs.match(/height="([^"]*)"/)?.[1] || '0'),
      };
    }

    if (id && (vertex || parent)) {
      cells.push({ id, value: decodeXmlEntities(value), style, vertex, parent, geometry });
    }
  }

  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">
  <defs>
    <style>
      .text { font-family: Arial, sans-serif; }
    </style>
  </defs>
`;

  // Background
  svg += `  <rect x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#ffffff" />
`;

  // Sort cells by their draw order (y position first, then x)
  const sortedCells = cells
    .filter(c => c.vertex && c.geometry.width > 0)
    .sort((a, b) => {
      const ay = a.geometry.y || 0;
      const by = b.geometry.y || 0;
      if (Math.abs(ay - by) < 5) return (a.geometry.x || 0) - (b.geometry.x || 0);
      return ay - by;
    });

  for (const cell of sortedCells) {
    const { value, style, geometry } = cell;
    const { x, y, width, height } = geometry;

    // Parse style attributes
    const fillColor = extractStyle(style, 'fillColor', '#ffffff');
    const strokeColor = extractStyle(style, 'strokeColor', 'none');
    const fontColor = extractStyle(style, 'fontColor', '#1f2937');
    const fontSize = extractStyle(style, 'fontSize', '12');
    const fontStyle = extractStyle(style, 'fontStyle', 'normal');
    const align = extractStyle(style, 'align', 'left');
    const verticalAlign = extractStyle(style, 'verticalAlign', 'middle');
    const spacingLeft = parseInt(extractStyle(style, 'spacingLeft', '0'));
    const rounded = style.includes('rounded=1');

    // Generate SVG element
    const rx = rounded ? '8' : '0';

    if (value.includes('COLOR SEMANTICS') || value.includes('VIEW MODES') || value.includes('THEMES') || value.includes('TAB DESCRIPTIONS')) {
      // Title text
      svg += `  <text x="${x + 10}" y="${y + 15}" font-size="10" font-weight="bold" fill="#6b7280" class="text">${escapeXml(value)}</text>
`;
    } else if (value && !value.startsWith('</') && cell.id?.includes('nav-')) {
      // Navigation items
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="${rx}" />
  <text x="${x + spacingLeft + 20}" y="${y + height/2 + 4}" font-size="${fontSize}" font-weight="${fontStyle === '1' ? 'bold' : 'normal'}" fill="${fontColor}" class="text">${escapeXml(value)}</text>
`;
    } else if (value && cell.id?.includes('header-') || cell.id === 'logo') {
      // Header elements
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="${rx}" />
  <text x="${x + spacingLeft + 20}" y="${y + height/2 + 4}" font-size="${fontSize}" font-weight="${fontStyle === '1' ? 'bold' : 'normal'}" fill="${fontColor}" class="text">${escapeXml(value)}</text>
`;
    } else if (value && cell.id?.includes('sidebar') && !cell.id.includes('nav')) {
      // Sidebar background
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" />
`;
    } else if (value && (cell.id?.includes('main') || cell.id?.includes('content'))) {
      // Main content area
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" />
`;
    } else if (value && (cell.id?.includes('footer') || cell.id === 'footer-docs' || cell.id === 'footer-copy')) {
      // Footer
      if (cell.id === 'footer-bg') {
        svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" />
`;
      } else {
        const textAlign = cell.id === 'footer-copy' ? 'end' : 'start';
        const xPos = cell.id === 'footer-copy' ? x + width - 20 : x + 20;
        svg += `  <text x="${xPos}" y="${y + 14}" font-size="12" fill="${fontColor}" text-anchor="${textAlign}" class="text">${escapeXml(value)}</text>
`;
      }
    } else if (value && cell.id?.includes('card-')) {
      // Cards
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + 30}" font-size="14" font-weight="bold" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n')[0])}</text>
  <text x="${x + width/2}" y="${y + 60}" font-size="12" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n').slice(2).join('\n'))}</text>
`;
    } else if (value && cell.id?.includes('chart-')) {
      // Chart placeholder
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + height/2}" font-size="14" fill="#6b7280" text-anchor="middle" class="text">${escapeXml(value.replace(/\n/g, '\n  '))}</text>
`;
    } else if (value && cell.id?.includes('benefit-')) {
      // Benefit cards
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + 40}" font-size="12" font-weight="bold" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n')[0])}</text>
  <text x="${x + width/2}" y="${y + 65}" font-size="11" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n').slice(2).join('\n'))}</text>
`;
    } else if (value && cell.id?.includes('color-') && !cell.id.includes('legend')) {
      // Color legend boxes
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + height/2 + 4}" font-size="${fontSize}" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value)}</text>
`;
    } else if (value && (cell.id?.includes('mode-') || cell.id?.includes('view-'))) {
      // View mode boxes
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + 25}" font-size="${fontSize}" font-weight="bold" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n')[0])}</text>
  <text x="${x + width/2}" y="${y + 50}" font-size="${parseInt(fontSize) - 1}" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n').slice(1).join('\n'))}</text>
`;
    } else if (value && cell.id?.includes('theme-')) {
      // Theme boxes
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + 25}" font-size="${fontSize}" font-weight="bold" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n')[0])}</text>
  <text x="${x + width/2}" y="${y + 50}" font-size="${parseInt(fontSize) - 1}" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value.split('\n').slice(1).join('\n'))}</text>
`;
    } else if (value && cell.id?.startsWith('tab-')) {
      // Tab descriptions
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + 10}" y="${y + 20}" font-size="9" fill="${fontColor}" class="text">${escapeXml(value)}</text>
`;
    } else if (value && cell.id === 'search') {
      // Search box
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + 10}" y="${y + 16}" font-size="${fontSize}" fill="${fontColor}" class="text">${escapeXml(value)}</text>
`;
    } else if (value && (cell.id === 'mode-toggle' || cell.id === 'theme-btn')) {
      // Buttons
      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" rx="4" />
  <text x="${x + width/2}" y="${y + 16}" font-size="${fontSize}" fill="${fontColor}" text-anchor="middle" class="text">${escapeXml(value)}</text>
`;
    } else if (value && (cell.id === 'nav-header')) {
      // Navigation header
      svg += `  <text x="${x + 20}" y="${y + 14}" font-size="11" font-weight="bold" fill="${fontColor}" class="text">${escapeXml(value)}</text>
`;
    }
  }

  svg += '</svg>';

  fs.writeFileSync(outputPath, svg);
  console.log(`SVG saved to: ${outputPath}`);
}

function extractStyle(style, prop, defaultVal) {
  const match = style.match(new RegExp(`${prop}=([^;\\s]+)`));
  return match ? match[1] : defaultVal;
}

function decodeXmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#xa;/g, '\n');
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main
const inputPath = path.join(__dirname, '../public/dashboard-layout.drawio');
const outputPath = path.join(__dirname, '../public/dashboard-layout.svg');

try {
  parseDrawioToSvg(inputPath, outputPath);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}