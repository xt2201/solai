import fs from 'fs';
import path from 'path';
import { generateThemeCSS } from '../src/utils/themeConfig';

const outputPath = path.resolve(__dirname, '../src/styles/generated-theme.css');

try {
  const css = generateThemeCSS();
  fs.writeFileSync(outputPath, css, 'utf8');
  console.log('✅ Theme CSS generated successfully at:', outputPath);
} catch (error) {
  console.error('❌ Error generating theme CSS:', error);
  process.exit(1);
}
