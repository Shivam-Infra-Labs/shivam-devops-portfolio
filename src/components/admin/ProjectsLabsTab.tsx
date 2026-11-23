'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { EngineeringProject, PortfolioData } from '@/src/types/portfolio';
import {
  AdminField,
  ItemActionControls,
  adminInputClass,
  adminMonoInputClass,
  moveArrayItem,
} from './AdminShared';

const CATEGORY_OPTIONS = ['DevOps', 'Networking', 'Full-Stack'];

export function ProjectsLabsTab({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (next: PortfolioData) => void;
}) {
  const { engineeringWork } = data;

  const updateItem = (idx: number, patch: Partial<EngineeringProject>) => {
    const next = [...engineeringWork];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, engineeringWork: next });
  };

  const addProject = () => {
    onChange({
      ...data,
      engineeringWork: [
        ...engineeringWork,
        {
          id: `project-${Date.now()}`,
          visible: true,
          category: 'DevOps',
          kicker: 'Hands-on Lab',
          title: 'New Engineering Project',
          repoName: 'Shivam-Infra-Labs/new-lab',
          summary: 'Concise factual summary of what was implemented and verified.',
          highlights: [
            'Containerized workload and verified local startup.',
          ],
          stackTags: ['Docker', 'Linux'],
          primaryUrl: 'https://github.com/Shivam-Infra-Labs',
          primaryLabel: 'View Lab',
          secondaryUrl: '',
          secondaryLabel: '',
          liveUrl: '',
          liveLabel: '',
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div>
          <h2 className="text-lg font-bold text-white">
            Engineering Projects & Labs
          </h2>
          <p className="text-xs text-slate-400">
            Create, reorder, toggle visibility, or remove any card in the Engineering Work & Labs grid.
          </p>
        </div>

        <button
          type="button"
          onClick={addProject}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Project / Lab</span>
        </button>
      </div>

      {engineeringWork.map((project, idx) => (
        <div
          key={project.id}
          className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="font-mono text-xs text-cyan-400">
                Card #{idx + 1} · {project.category || 'DevOps'}
              </span>
              <h3 className="text-base font-bold text-white">{project.title}</h3>
            </div>

            <ItemActionControls
              index={idx}
              total={engineeringWork.length}
              visible={project.visible !== false}
              onToggleVisible={() =>
                updateItem(idx, { visible: project.visible === false })
              }
              onMoveUp={() =>
                onChange({
                  ...data,
                  engineeringWork: moveArrayItem(engineeringWork, idx, -1),
                })
              }
              onMoveDown={() =>
                onChange({
                  ...data,
                  engineeringWork: moveArrayItem(engineeringWork, idx, 1),
                })
              }
              onDelete={() =>
                onChange({
                  ...data,
                  engineeringWork: engineeringWork.filter((_, i) => i !== idx),
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminField label="Card Title">
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateItem(idx, { title: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>

            <AdminField label="Category Tag">
              <select
                value={project.category || 'DevOps'}
                onChange={(e) => updateItem(idx, { category: e.target.value })}
                className={adminInputClass}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Kicker Label">
              <input
                type="text"
                value={project.kicker}
                onChange={(e) => updateItem(idx, { kicker: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>

            <AdminField label="Repo / Subtitle Identifier">
              <input
                type="text"
                value={project.repoName}
                onChange={(e) => updateItem(idx, { repoName: e.target.value })}
                className={adminMonoInputClass}
              />
            </AdminField>

            <div className="md:col-span-2">
              <AdminField label="Summary">
                <textarea
                  rows={2}
                  value={project.summary}
                  onChange={(e) => updateItem(idx, { summary: e.target.value })}
                  className={adminInputClass}
                />
              </AdminField>
            </div>

            <AdminField label="Primary GitHub URL">
              <input
                type="url"
                value={project.primaryUrl}
                onChange={(e) =>
                  updateItem(idx, { primaryUrl: e.target.value })
                }
                className={adminMonoInputClass}
              />
            </AdminField>

            <AdminField label="Primary Button Label (e.g. View Lab / Read Case Study)">
              <input
                type="text"
                value={project.primaryLabel}
                onChange={(e) =>
                  updateItem(idx, { primaryLabel: e.target.value })
                }
                className={adminInputClass}
              />
            </AdminField>

            <AdminField label="Secondary Repo URL (optional)">
              <input
                type="url"
                value={project.secondaryUrl ?? ''}
                onChange={(e) =>
                  updateItem(idx, { secondaryUrl: e.target.value })
                }
                className={adminMonoInputClass}
              />
            </AdminField>

            <AdminField label="Secondary Button Label (optional)">
              <input
                type="text"
                value={project.secondaryLabel ?? ''}
                onChange={(e) =>
                  updateItem(idx, { secondaryLabel: e.target.value })
                }
                className={adminInputClass}
              />
            </AdminField>

            <AdminField label="Live Demo URL (optional)">
              <input
                type="url"
                value={project.liveUrl ?? ''}
                onChange={(e) => updateItem(idx, { liveUrl: e.target.value })}
                placeholder="https://..."
                className={adminMonoInputClass}
              />
            </AdminField>

            <AdminField label="Live Demo Button Label (optional)">
              <input
                type="text"
                value={project.liveLabel ?? ''}
                onChange={(e) => updateItem(idx, { liveLabel: e.target.value })}
                placeholder="Live Demo"
                className={adminInputClass}
              />
            </AdminField>

            <div className="md:col-span-2">
              <AdminField label="Tech Stack Tags (comma-separated)">
                <input
                  type="text"
                  value={project.stackTags.join(', ')}
                  onChange={(e) =>
                    updateItem(idx, {
                      stackTags: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className={adminMonoInputClass}
                />
              </AdminField>
            </div>

            <div className="md:col-span-2">
              <AdminField label="Highlights (one per line)">
                <textarea
                  rows={3}
                  value={project.highlights.join('\n')}
                  onChange={(e) =>
                    updateItem(idx, {
                      highlights: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className={adminInputClass}
                />
              </AdminField>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
