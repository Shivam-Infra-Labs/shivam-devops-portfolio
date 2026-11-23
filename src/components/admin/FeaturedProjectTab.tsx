'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { ArchitectureNode, PortfolioData } from '@/src/types/portfolio';
import {
  AdminField,
  ItemActionControls,
  adminInputClass,
  adminMonoInputClass,
  moveArrayItem,
} from './AdminShared';

export function FeaturedProjectTab({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (next: PortfolioData) => void;
}) {
  const { featuredProject } = data;

  const updateFeatured = (patch: Partial<typeof featuredProject>) => {
    onChange({
      ...data,
      featuredProject: {
        ...featuredProject,
        ...patch,
      },
    });
  };

  const updateCaseStudy = (
    patch: Partial<typeof featuredProject.caseStudy>
  ) => {
    updateFeatured({
      caseStudy: {
        ...featuredProject.caseStudy,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Main Featured Project Fields */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Featured Project & Case Study
            </h2>
            <p className="text-xs text-slate-400">
              Edit the flagship MEAN Kubernetes showcase, architecture nodes, contributions, and file proof links.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateFeatured({ visible: featuredProject.visible === false })
            }
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              featuredProject.visible !== false
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {featuredProject.visible !== false
              ? 'Featured Section Visible'
              : 'Featured Section Hidden'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminField label="Kicker Label">
            <input
              type="text"
              value={featuredProject.kicker}
              onChange={(e) => updateFeatured({ kicker: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Project Title">
            <input
              type="text"
              value={featuredProject.title}
              onChange={(e) => updateFeatured({ title: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Repository Slug (owner/repo)">
            <input
              type="text"
              value={featuredProject.repoName}
              onChange={(e) => updateFeatured({ repoName: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField label="Repository URL">
            <input
              type="url"
              value={featuredProject.repoUrl}
              onChange={(e) => updateFeatured({ repoUrl: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>

          <div className="md:col-span-2">
            <AdminField label="Summary">
              <textarea
                rows={2}
                value={featuredProject.summary}
                onChange={(e) => updateFeatured({ summary: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>
          </div>

          <div className="md:col-span-2">
            <AdminField
              label="Stack Tags (comma-separated)"
              hint="Rendered as unboxed metadata with typographic separators."
            >
              <input
                type="text"
                value={featuredProject.stackTags.join(', ')}
                onChange={(e) =>
                  updateFeatured({
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
        </div>
      </div>

      {/* Key Contributions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Key Engineering Contributions
          </h3>
          <button
            type="button"
            onClick={() =>
              updateFeatured({
                contributions: [
                  ...featuredProject.contributions,
                  'New verifiable contribution',
                ],
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Contribution</span>
          </button>
        </div>

        <div className="space-y-3">
          {featuredProject.contributions.map((contrib, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs text-cyan-300">
                  Contribution #{idx + 1}
                </span>
                <ItemActionControls
                  index={idx}
                  total={featuredProject.contributions.length}
                  onMoveUp={() =>
                    updateFeatured({
                      contributions: moveArrayItem(
                        featuredProject.contributions,
                        idx,
                        -1
                      ),
                    })
                  }
                  onMoveDown={() =>
                    updateFeatured({
                      contributions: moveArrayItem(
                        featuredProject.contributions,
                        idx,
                        1
                      ),
                    })
                  }
                  onDelete={() =>
                    updateFeatured({
                      contributions: featuredProject.contributions.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                />
              </div>
              <textarea
                rows={2}
                value={contrib}
                onChange={(e) => {
                  const next = [...featuredProject.contributions];
                  next[idx] = e.target.value;
                  updateFeatured({ contributions: next });
                }}
                className={adminInputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram Nodes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Architecture Diagram Stages
            </h3>
            <p className="text-xs text-slate-400">
              Interactive stage callouts displayed under the pipeline SVG diagram.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateFeatured({
                architectureNodes: [
                  ...featuredProject.architectureNodes,
                  {
                    id: `node-${Date.now()}`,
                    stage: '05. Stage',
                    title: 'New Stage',
                    subtitle: 'Component Role',
                    detail: 'Stage architecture explanation',
                    accent: 'cyan',
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Stage</span>
          </button>
        </div>

        <div className="space-y-3">
          {featuredProject.architectureNodes.map((node, idx) => (
            <div
              key={node.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-300">
                  {node.stage} · {node.title}
                </span>
                <ItemActionControls
                  index={idx}
                  total={featuredProject.architectureNodes.length}
                  onMoveUp={() =>
                    updateFeatured({
                      architectureNodes: moveArrayItem(
                        featuredProject.architectureNodes,
                        idx,
                        -1
                      ),
                    })
                  }
                  onMoveDown={() =>
                    updateFeatured({
                      architectureNodes: moveArrayItem(
                        featuredProject.architectureNodes,
                        idx,
                        1
                      ),
                    })
                  }
                  onDelete={() =>
                    updateFeatured({
                      architectureNodes:
                        featuredProject.architectureNodes.filter(
                          (_, i) => i !== idx
                        ),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <AdminField label="Stage">
                  <input
                    type="text"
                    value={node.stage}
                    onChange={(e) => {
                      const next = [...featuredProject.architectureNodes];
                      next[idx] = { ...node, stage: e.target.value };
                      updateFeatured({ architectureNodes: next });
                    }}
                    className={adminMonoInputClass}
                  />
                </AdminField>
                <AdminField label="Title">
                  <input
                    type="text"
                    value={node.title}
                    onChange={(e) => {
                      const next = [...featuredProject.architectureNodes];
                      next[idx] = { ...node, title: e.target.value };
                      updateFeatured({ architectureNodes: next });
                    }}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Accent">
                  <select
                    value={node.accent}
                    onChange={(e) => {
                      const next = [...featuredProject.architectureNodes];
                      next[idx] = {
                        ...node,
                        accent: e.target.value as ArchitectureNode['accent'],
                      };
                      updateFeatured({ architectureNodes: next });
                    }}
                    className={adminInputClass}
                  >
                    <option value="cyan">cyan</option>
                    <option value="emerald">emerald</option>
                    <option value="sky">sky</option>
                  </select>
                </AdminField>
                <div className="sm:col-span-3">
                  <AdminField label="Detail Explanation">
                    <input
                      type="text"
                      value={node.detail}
                      onChange={(e) => {
                        const next = [...featuredProject.architectureNodes];
                        next[idx] = { ...node, detail: e.target.value };
                        updateFeatured({ architectureNodes: next });
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Study & Direct GitHub File Proof Links */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6 space-y-5">
        <h3 className="text-base font-bold text-white">
          Case Study Modal & GitHub File Proof Links
        </h3>

        <AdminField label="Case Study Overview">
          <textarea
            rows={2}
            value={featuredProject.caseStudy.overview}
            onChange={(e) => updateCaseStudy({ overview: e.target.value })}
            className={adminInputClass}
          />
        </AdminField>

        <AdminField label="Engineering Problem">
          <textarea
            rows={2}
            value={featuredProject.caseStudy.problem}
            onChange={(e) => updateCaseStudy({ problem: e.target.value })}
            className={adminInputClass}
          />
        </AdminField>

        <AdminField label="Verified Outcome">
          <textarea
            rows={2}
            value={featuredProject.caseStudy.outcome}
            onChange={(e) => updateCaseStudy({ outcome: e.target.value })}
            className={adminInputClass}
          />
        </AdminField>

        <div className="border-t border-slate-800 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">
              Repository File Proof Links
            </h4>
            <button
              type="button"
              onClick={() =>
                updateCaseStudy({
                  files: [
                    ...featuredProject.caseStudy.files,
                    {
                      path: 'k8s/service.yaml',
                      purpose: 'Service routing manifest',
                      repoFileUrl: featuredProject.repoUrl,
                    },
                  ],
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add File Proof</span>
            </button>
          </div>

          <div className="space-y-3">
            {featuredProject.caseStudy.files.map((file, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-300">
                    {file.path}
                  </span>
                  <ItemActionControls
                    index={idx}
                    total={featuredProject.caseStudy.files.length}
                    onMoveUp={() =>
                      updateCaseStudy({
                        files: moveArrayItem(
                          featuredProject.caseStudy.files,
                          idx,
                          -1
                        ),
                      })
                    }
                    onMoveDown={() =>
                      updateCaseStudy({
                        files: moveArrayItem(
                          featuredProject.caseStudy.files,
                          idx,
                          1
                        ),
                      })
                    }
                    onDelete={() =>
                      updateCaseStudy({
                        files: featuredProject.caseStudy.files.filter(
                          (_, i) => i !== idx
                        ),
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <AdminField label="File / Directory Path">
                    <input
                      type="text"
                      value={file.path}
                      onChange={(e) => {
                        const next = [...featuredProject.caseStudy.files];
                        next[idx] = { ...file, path: e.target.value };
                        updateCaseStudy({ files: next });
                      }}
                      className={adminMonoInputClass}
                    />
                  </AdminField>
                  <AdminField label="Purpose">
                    <input
                      type="text"
                      value={file.purpose}
                      onChange={(e) => {
                        const next = [...featuredProject.caseStudy.files];
                        next[idx] = { ...file, purpose: e.target.value };
                        updateCaseStudy({ files: next });
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Direct GitHub File URL">
                    <input
                      type="url"
                      value={file.repoFileUrl ?? ''}
                      onChange={(e) => {
                        const next = [...featuredProject.caseStudy.files];
                        next[idx] = { ...file, repoFileUrl: e.target.value };
                        updateCaseStudy({ files: next });
                      }}
                      className={adminMonoInputClass}
                    />
                  </AdminField>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
