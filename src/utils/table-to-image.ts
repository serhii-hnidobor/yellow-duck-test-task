import { createCanvas } from 'canvas';
import { CanvasTable, CTColumn, CTConfig, CTData } from 'canvas-table';

async function tableToImage(data: CTData, headerData: CTColumn[]) {
  const canvas = createCanvas(800, 800);

  const config: CTConfig = { columns: headerData, data };

  const context = new CanvasTable(canvas, config);
  await context.generateTable();

  return context.renderToBuffer();
}

export default tableToImage;
