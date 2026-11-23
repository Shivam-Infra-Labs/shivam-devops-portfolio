'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { PortfolioData, ServiceOffering } from '@/src/types/portfolio';
import {
  AdminField,
  ItemActionControls,
  adminInputClass,
  adminMonoInputClass,
  moveArrayItem,
} from './AdminShared';

export function ServicesContactTab({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (next: PortfolioData) => void;
}) {
  const { services, contactSettings } = data;

  const updateService = (idx: number, patch: Partial<ServiceOffering>) => {
    const next = [...services];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, services: next });
  };

  return (
    <div className="space-y-8">
      {/* Contact & Web3Forms Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">
          Contact & Web3Forms Settings
        </h2>
        <p className="mb-5 text-xs text-slate-400">
          Configure recipient email and optional public Web3Forms access key (falls back cleanly to mailto: if empty).
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminField label="Recipient Email">
            <input
              type="email"
              value={contactSettings.recipientEmail}
              onChange={(e) =>
                onChange({
                  ...data,
                  contactSettings: {
                    ...contactSettings,
                    recipientEmail: e.target.value,
                  },
                })
              }
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField
            label="Web3Forms Public Access Key (optional)"
            hint="Overrides NEXT_PUBLIC_WEB3FORMS_KEY if set."
          >
            <input
              type="text"
              value={contactSettings.web3FormsKey}
              onChange={(e) =>
                onChange({
                  ...data,
                  contactSettings: {
                    ...contactSettings,
                    web3FormsKey: e.target.value,
                  },
                })
              }
              placeholder="Leave empty for mailto fallback or env key"
              className={adminMonoInputClass}
            />
          </AdminField>

          <div className="md:col-span-2">
            <AdminField label="Contact Intro / Response Note">
              <input
                type="text"
                value={contactSettings.responseNote}
                onChange={(e) =>
                  onChange({
                    ...data,
                    contactSettings: {
                      ...contactSettings,
                      responseNote: e.target.value,
                    },
                  })
                }
                className={adminInputClass}
              />
            </AdminField>
          </div>
        </div>
      </div>

      {/* Freelance Services CRUD */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Freelance Service Packages
            </h2>
            <p className="text-xs text-slate-400">
              Edit deliverables, proof links, CTA labels, and contact pre-fill payloads.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                services: [
                  ...services,
                  {
                    id: `service-${Date.now()}`,
                    visible: true,
                    number: `0${services.length + 1}`,
                    title: 'New DevOps Service',
                    summary: 'Clear scope summary for this offering.',
                    deliverables: ['Configuration files', 'Verification guide'],
                    proofLabel: 'Proof: MEAN Stack Deployment',
                    proofAnchor: '#projects',
                    ctaLabel: 'Request Quote',
                    prefillStack: 'Your current app stack',
                    prefillHelp: 'Describe your infrastructure requirements...',
                  },
                ],
              })
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="space-y-5">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <span className="font-mono text-xs text-cyan-300">
                  {service.number}. {service.title}
                </span>
                <ItemActionControls
                  index={idx}
                  total={services.length}
                  visible={service.visible !== false}
                  onToggleVisible={() =>
                    updateService(idx, { visible: service.visible === false })
                  }
                  onMoveUp={() =>
                    onChange({
                      ...data,
                      services: moveArrayItem(services, idx, -1),
                    })
                  }
                  onMoveDown={() =>
                    onChange({
                      ...data,
                      services: moveArrayItem(services, idx, 1),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...data,
                      services: services.filter((_, i) => i !== idx),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminField label="Service Number">
                  <input
                    type="text"
                    value={service.number}
                    onChange={(e) =>
                      updateService(idx, { number: e.target.value })
                    }
                    className={adminMonoInputClass}
                  />
                </AdminField>

                <AdminField label="Service Title">
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) =>
                      updateService(idx, { title: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>

                <div className="md:col-span-2">
                  <AdminField label="Summary">
                    <textarea
                      rows={2}
                      value={service.summary}
                      onChange={(e) =>
                        updateService(idx, { summary: e.target.value })
                      }
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>

                <div className="md:col-span-2">
                  <AdminField label="Deliverables (one per line)">
                    <textarea
                      rows={3}
                      value={service.deliverables.join('\n')}
                      onChange={(e) =>
                        updateService(idx, {
                          deliverables: e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>

                <AdminField label="Proof Link Label">
                  <input
                    type="text"
                    value={service.proofLabel}
                    onChange={(e) =>
                      updateService(idx, { proofLabel: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>

                <AdminField label="Proof Target (#anchor or URL)">
                  <input
                    type="text"
                    value={service.proofAnchor}
                    onChange={(e) =>
                      updateService(idx, { proofAnchor: e.target.value })
                    }
                    className={adminMonoInputClass}
                  />
                </AdminField>

                <AdminField label="CTA Button Label">
                  <input
                    type="text"
                    value={service.ctaLabel}
                    onChange={(e) =>
                      updateService(idx, { ctaLabel: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>

                <AdminField label="Contact Pre-fill: App Stack">
                  <input
                    type="text"
                    value={service.prefillStack}
                    onChange={(e) =>
                      updateService(idx, { prefillStack: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>

                <div className="md:col-span-2">
                  <AdminField label="Contact Pre-fill: Required Help">
                    <textarea
                      rows={2}
                      value={service.prefillHelp}
                      onChange={(e) =>
                        updateService(idx, { prefillHelp: e.target.value })
                      }
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
