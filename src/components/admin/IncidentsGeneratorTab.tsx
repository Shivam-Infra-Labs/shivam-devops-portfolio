'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { IncidentScenario, PortfolioData } from '@/src/types/portfolio';
import {
  AdminField,
  ItemActionControls,
  adminInputClass,
  adminMonoInputClass,
  moveArrayItem,
} from './AdminShared';

export function IncidentsGeneratorTab({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (next: PortfolioData) => void;
}) {
  const { incidentScenarios, generatorSettings } = data;

  const updateScenario = (idx: number, patch: Partial<IncidentScenario>) => {
    const next = [...incidentScenarios];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, incidentScenarios: next });
  };

  return (
    <div className="space-y-8">
      {/* Pro Generator Pricing & Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">
          Generator Defaults & Pro Template Pricing
        </h2>
        <p className="mb-5 text-xs text-slate-400">
          Configure annotated blueprint defaults alongside INR/USD pricing and checkout URL for Pro Generator templates.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField label="Default Base Image">
            <input
              type="text"
              value={generatorSettings.defaultBaseImage}
              onChange={(e) =>
                onChange({
                  ...data,
                  generatorSettings: {
                    ...generatorSettings,
                    defaultBaseImage: e.target.value,
                  },
                })
              }
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField label="Default Container Port">
            <input
              type="number"
              value={generatorSettings.defaultPort}
              onChange={(e) =>
                onChange({
                  ...data,
                  generatorSettings: {
                    ...generatorSettings,
                    defaultPort: Number(e.target.value) || 3000,
                  },
                })
              }
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField label="Enable Healthcheck by Default">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...data,
                  generatorSettings: {
                    ...generatorSettings,
                    enableHealthcheck: !generatorSettings.enableHealthcheck,
                  },
                })
              }
              className={`min-h-[42px] rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                generatorSettings.enableHealthcheck
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {generatorSettings.enableHealthcheck ? 'Enabled' : 'Disabled'}
            </button>
          </AdminField>

          <AdminField label="Pro Plan Label">
            <input
              type="text"
              value={generatorSettings.proPlanLabel}
              onChange={(e) =>
                onChange({
                  ...data,
                  generatorSettings: {
                    ...generatorSettings,
                    proPlanLabel: e.target.value,
                  },
                })
              }
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Pro Price (INR)">
            <input
              type="text"
              value={generatorSettings.proPriceInr}
              onChange={(e) =>
                onChange({
                  ...data,
                  generatorSettings: {
                    ...generatorSettings,
                    proPriceInr: e.target.value,
                  },
                })
              }
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField label="Pro Price (USD)">
            <input
              type="text"
              value={generatorSettings.proPriceUsd}
              onChange={(e) =>
                onChange({
                  ...data,
                  generatorSettings: {
                    ...generatorSettings,
                    proPriceUsd: e.target.value,
                  },
                })
              }
              className={adminMonoInputClass}
            />
          </AdminField>

          <div className="md:col-span-3">
            <AdminField label="Pro Payment / Checkout URL">
              <input
                type="text"
                value={generatorSettings.paymentUrl}
                onChange={(e) =>
                  onChange({
                    ...data,
                    generatorSettings: {
                      ...generatorSettings,
                      paymentUrl: e.target.value,
                    },
                  })
                }
                className={adminMonoInputClass}
              />
            </AdminField>
          </div>
        </div>
      </div>

      {/* Incident Response Lab Scenarios */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Incident Response Lab Scenarios
            </h2>
            <p className="text-xs text-slate-400">
              Edit symptoms, triage choices, terminal outputs, root causes, dual fixes, and interview summaries.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                incidentScenarios: [
                  ...incidentScenarios,
                  {
                    id: `incident-${Date.now()}`,
                    visible: true,
                    title: 'New Troubleshooting Scenario',
                    category: 'Kubernetes',
                    severity: 'Triage Lab',
                    symptom: 'Describe what failed from the operator perspective.',
                    triageOptions: [
                      {
                        id: `triage-${Date.now()}`,
                        label: 'Inspect Status',
                        command: 'kubectl get pods',
                        output: 'NAME   READY   STATUS\napp    1/1     Running',
                        insight: 'Key finding from command output.',
                        isPrimaryClue: true,
                      },
                    ],
                    rootCause: 'Explain the exact underlying misconfiguration.',
                    fixes: [
                      {
                        id: `fix-${Date.now()}`,
                        label: 'Recommended Fix',
                        command: 'kubectl apply -f fix.yaml',
                        explanation: 'Why this command resolves the issue.',
                      },
                    ],
                    verificationCommand: 'curl -I http://localhost:8080',
                    verificationOutput: 'HTTP/1.1 200 OK',
                    interviewSummary:
                      'Concise 2-sentence explanation for technical interviews.',
                  },
                ],
              })
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Incident Scenario</span>
          </button>
        </div>

        <div className="space-y-6">
          {incidentScenarios.map((scenario, idx) => (
            <div
              key={scenario.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="font-mono text-xs text-cyan-300">
                  Scenario #{idx + 1} · {scenario.category}
                </span>
                <ItemActionControls
                  index={idx}
                  total={incidentScenarios.length}
                  visible={scenario.visible !== false}
                  onToggleVisible={() =>
                    updateScenario(idx, { visible: scenario.visible === false })
                  }
                  onMoveUp={() =>
                    onChange({
                      ...data,
                      incidentScenarios: moveArrayItem(
                        incidentScenarios,
                        idx,
                        -1
                      ),
                    })
                  }
                  onMoveDown={() =>
                    onChange({
                      ...data,
                      incidentScenarios: moveArrayItem(
                        incidentScenarios,
                        idx,
                        1
                      ),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...data,
                      incidentScenarios: incidentScenarios.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <AdminField label="Scenario Title">
                  <input
                    type="text"
                    value={scenario.title}
                    onChange={(e) =>
                      updateScenario(idx, { title: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Category">
                  <input
                    type="text"
                    value={scenario.category}
                    onChange={(e) =>
                      updateScenario(idx, { category: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Severity / Tag">
                  <input
                    type="text"
                    value={scenario.severity}
                    onChange={(e) =>
                      updateScenario(idx, { severity: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
              </div>

              <AdminField label="Symptom">
                <textarea
                  rows={2}
                  value={scenario.symptom}
                  onChange={(e) =>
                    updateScenario(idx, { symptom: e.target.value })
                  }
                  className={adminInputClass}
                />
              </AdminField>

              <AdminField label="Root Cause">
                <textarea
                  rows={2}
                  value={scenario.rootCause}
                  onChange={(e) =>
                    updateScenario(idx, { rootCause: e.target.value })
                  }
                  className={adminInputClass}
                />
              </AdminField>

              {/* Triage Options */}
              <div className="space-y-3 border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Step 1 Triage Commands ({scenario.triageOptions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateScenario(idx, {
                        triageOptions: [
                          ...scenario.triageOptions,
                          {
                            id: `opt-${Date.now()}`,
                            label: 'New Triage Check',
                            command: 'kubectl describe svc',
                            output: 'Output...',
                            insight: 'Insight...',
                            isPrimaryClue: false,
                          },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-400/50"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    <span>Add Triage Option</span>
                  </button>
                </div>

                {scenario.triageOptions.map((opt, optIdx) => (
                  <div
                    key={opt.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-300">
                        Option #{optIdx + 1}: {opt.label}
                      </span>
                      <ItemActionControls
                        index={optIdx}
                        total={scenario.triageOptions.length}
                        onMoveUp={() =>
                          updateScenario(idx, {
                            triageOptions: moveArrayItem(
                              scenario.triageOptions,
                              optIdx,
                              -1
                            ),
                          })
                        }
                        onMoveDown={() =>
                          updateScenario(idx, {
                            triageOptions: moveArrayItem(
                              scenario.triageOptions,
                              optIdx,
                              1
                            ),
                          })
                        }
                        onDelete={() =>
                          updateScenario(idx, {
                            triageOptions: scenario.triageOptions.filter(
                              (_, i) => i !== optIdx
                            ),
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <input
                        type="text"
                        value={opt.label}
                        placeholder="Choice button label"
                        onChange={(e) => {
                          const nextOpts = [...scenario.triageOptions];
                          nextOpts[optIdx] = { ...opt, label: e.target.value };
                          updateScenario(idx, { triageOptions: nextOpts });
                        }}
                        className={adminInputClass}
                      />
                      <input
                        type="text"
                        value={opt.command}
                        placeholder="Terminal command"
                        onChange={(e) => {
                          const nextOpts = [...scenario.triageOptions];
                          nextOpts[optIdx] = {
                            ...opt,
                            command: e.target.value,
                          };
                          updateScenario(idx, { triageOptions: nextOpts });
                        }}
                        className={adminMonoInputClass}
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={opt.output}
                      placeholder="Terminal output"
                      onChange={(e) => {
                        const nextOpts = [...scenario.triageOptions];
                        nextOpts[optIdx] = { ...opt, output: e.target.value };
                        updateScenario(idx, { triageOptions: nextOpts });
                      }}
                      className={adminMonoInputClass}
                    />
                    <input
                      type="text"
                      value={opt.insight}
                      placeholder="Observation insight"
                      onChange={(e) => {
                        const nextOpts = [...scenario.triageOptions];
                        nextOpts[optIdx] = { ...opt, insight: e.target.value };
                        updateScenario(idx, { triageOptions: nextOpts });
                      }}
                      className={adminInputClass}
                    />
                  </div>
                ))}
              </div>

              {/* Fixes */}
              <div className="space-y-3 border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Step 2 Fixes ({scenario.fixes.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateScenario(idx, {
                        fixes: [
                          ...scenario.fixes,
                          {
                            id: `fix-${Date.now()}`,
                            label: 'New Fix Option',
                            command: '# command',
                            explanation: 'Explanation',
                          },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:border-emerald-400/50"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    <span>Add Fix</span>
                  </button>
                </div>

                {scenario.fixes.map((fix, fixIdx) => (
                  <div
                    key={fix.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-emerald-300">
                        {fix.label}
                      </span>
                      <ItemActionControls
                        index={fixIdx}
                        total={scenario.fixes.length}
                        onMoveUp={() =>
                          updateScenario(idx, {
                            fixes: moveArrayItem(scenario.fixes, fixIdx, -1),
                          })
                        }
                        onMoveDown={() =>
                          updateScenario(idx, {
                            fixes: moveArrayItem(scenario.fixes, fixIdx, 1),
                          })
                        }
                        onDelete={() =>
                          updateScenario(idx, {
                            fixes: scenario.fixes.filter((_, i) => i !== fixIdx),
                          })
                        }
                      />
                    </div>
                    <input
                      type="text"
                      value={fix.label}
                      onChange={(e) => {
                        const nextFixes = [...scenario.fixes];
                        nextFixes[fixIdx] = { ...fix, label: e.target.value };
                        updateScenario(idx, { fixes: nextFixes });
                      }}
                      className={adminInputClass}
                    />
                    <textarea
                      rows={2}
                      value={fix.command}
                      onChange={(e) => {
                        const nextFixes = [...scenario.fixes];
                        nextFixes[fixIdx] = { ...fix, command: e.target.value };
                        updateScenario(idx, { fixes: nextFixes });
                      }}
                      className={adminMonoInputClass}
                    />
                    <input
                      type="text"
                      value={fix.explanation}
                      onChange={(e) => {
                        const nextFixes = [...scenario.fixes];
                        nextFixes[fixIdx] = {
                          ...fix,
                          explanation: e.target.value,
                        };
                        updateScenario(idx, { fixes: nextFixes });
                      }}
                      className={adminInputClass}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminField label="Verification Command">
                  <input
                    type="text"
                    value={scenario.verificationCommand}
                    onChange={(e) =>
                      updateScenario(idx, {
                        verificationCommand: e.target.value,
                      })
                    }
                    className={adminMonoInputClass}
                  />
                </AdminField>
                <AdminField label="Verification Output">
                  <textarea
                    rows={2}
                    value={scenario.verificationOutput}
                    onChange={(e) =>
                      updateScenario(idx, {
                        verificationOutput: e.target.value,
                      })
                    }
                    className={adminMonoInputClass}
                  />
                </AdminField>
              </div>

              <AdminField label="Interview Explanation Summary">
                <textarea
                  rows={2}
                  value={scenario.interviewSummary}
                  onChange={(e) =>
                    updateScenario(idx, { interviewSummary: e.target.value })
                  }
                  className={adminInputClass}
                />
              </AdminField>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
