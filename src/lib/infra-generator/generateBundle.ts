import JSZip from 'jszip';
import { ARTIFACT_CATALOG } from './catalog';
import { renderCoreArtifact } from './templatesCore';
import { renderCloudArtifact } from './templatesCloud';
import type { ArtifactDefinition, GeneratorParams } from './types';

export interface GeneratedFile extends ArtifactDefinition {
  content: string;
}

export function generateSelectedArtifacts(
  selectedIds: string[],
  params: GeneratorParams
): GeneratedFile[] {
  const selectedSet = new Set(selectedIds);
  const output: GeneratedFile[] = [];

  for (const def of ARTIFACT_CATALOG) {
    if (!selectedSet.has(def.id)) continue;
    const content =
      renderCoreArtifact(def.id, params) ??
      renderCloudArtifact(def.id, params) ??
      `# ${def.path}\n`;
    output.push({
      ...def,
      content,
    });
  }

  return output;
}

export async function exportArtifactsAsZip(
  files: GeneratedFile[],
  appName: string
): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${appName || 'app'}-devsecops-bundle.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
