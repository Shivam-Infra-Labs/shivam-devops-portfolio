'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type {
  CertificationEntry,
  EducationEntry,
  PortfolioData,
} from '@/src/types/portfolio';
import {
  AdminField,
  ItemActionControls,
  adminInputClass,
  adminMonoInputClass,
  moveArrayItem,
} from './AdminShared';

export function EducationCertsTab({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (next: PortfolioData) => void;
}) {
  const { educationList, certifications, about } = data;

  const updateEdu = (idx: number, patch: Partial<EducationEntry>) => {
    const next = [...educationList];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, educationList: next });
  };

  const updateCert = (idx: number, patch: Partial<CertificationEntry>) => {
    const next = [...certifications];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, certifications: next });
  };

  return (
    <div className="space-y-8">
      {/* About Intro & Journey */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">About Summary</h2>
        <AdminField label="Intro Paragraph">
          <textarea
            rows={2}
            value={about.intro}
            onChange={(e) =>
              onChange({
                ...data,
                about: { ...about, intro: e.target.value },
              })
            }
            className={adminInputClass}
          />
        </AdminField>
        <AdminField label="Networking-to-DevOps Journey">
          <textarea
            rows={3}
            value={about.journey}
            onChange={(e) =>
              onChange({
                ...data,
                about: { ...about, journey: e.target.value },
              })
            }
            className={adminInputClass}
          />
        </AdminField>
      </div>

      {/* Education Entries */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Education Entries</h2>
            <p className="text-xs text-slate-400">
              Add, edit, reorder, or hide degrees, diplomas, years, and core coursework.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                educationList: [
                  ...educationList,
                  {
                    id: `edu-${Date.now()}`,
                    visible: true,
                    degree: 'New Degree / Diploma',
                    institution: 'Institution Name',
                    years: '2024 – 2027',
                    details: 'Relevant technical foundation and coursework.',
                    focusAreas: ['Linux', 'Networking'],
                  },
                ],
              })
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Education</span>
          </button>
        </div>

        <div className="space-y-4">
          {educationList.map((edu, idx) => (
            <div
              key={edu.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-cyan-300">
                  {edu.degree}
                </span>
                <ItemActionControls
                  index={idx}
                  total={educationList.length}
                  visible={edu.visible !== false}
                  onToggleVisible={() =>
                    updateEdu(idx, { visible: edu.visible === false })
                  }
                  onMoveUp={() =>
                    onChange({
                      ...data,
                      educationList: moveArrayItem(educationList, idx, -1),
                    })
                  }
                  onMoveDown={() =>
                    onChange({
                      ...data,
                      educationList: moveArrayItem(educationList, idx, 1),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...data,
                      educationList: educationList.filter((_, i) => i !== idx),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <AdminField label="Degree / Diploma">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEdu(idx, { degree: e.target.value })}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Institution">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEdu(idx, { institution: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Years / Duration">
                  <input
                    type="text"
                    value={edu.years}
                    onChange={(e) => updateEdu(idx, { years: e.target.value })}
                    className={adminMonoInputClass}
                  />
                </AdminField>
                <div className="md:col-span-3">
                  <AdminField label="Coursework Details">
                    <textarea
                      rows={2}
                      value={edu.details}
                      onChange={(e) =>
                        updateEdu(idx, { details: e.target.value })
                      }
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>
                <div className="md:col-span-3">
                  <AdminField label="Focus Areas (comma-separated)">
                    <input
                      type="text"
                      value={edu.focusAreas.join(', ')}
                      onChange={(e) =>
                        updateEdu(idx, {
                          focusAreas: e.target.value
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
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Certifications & Verified Tracks
            </h2>
            <p className="text-xs text-slate-400">
              Manage issuer, year, summary, and verification proof URLs.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                certifications: [
                  ...certifications,
                  {
                    id: `cert-${Date.now()}`,
                    visible: true,
                    title: 'New Certification',
                    issuer: 'Issuing Organization',
                    year: '2026',
                    category: 'Cloud / DevOps',
                    summary: 'Verified credential scope and hands-on focus.',
                    proofUrl: 'https://github.com/Shivam-Infra-Labs',
                    proofLabel: 'Verify Credential',
                  },
                ],
              })
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Certification</span>
          </button>
        </div>

        <div className="space-y-4">
          {certifications.map((cert, idx) => (
            <div
              key={cert.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-emerald-300">
                  {cert.title} · {cert.year}
                </span>
                <ItemActionControls
                  index={idx}
                  total={certifications.length}
                  visible={cert.visible !== false}
                  onToggleVisible={() =>
                    updateCert(idx, { visible: cert.visible === false })
                  }
                  onMoveUp={() =>
                    onChange({
                      ...data,
                      certifications: moveArrayItem(certifications, idx, -1),
                    })
                  }
                  onMoveDown={() =>
                    onChange({
                      ...data,
                      certifications: moveArrayItem(certifications, idx, 1),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...data,
                      certifications: certifications.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminField label="Title">
                  <input
                    type="text"
                    value={cert.title}
                    onChange={(e) => updateCert(idx, { title: e.target.value })}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Issuer">
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) =>
                      updateCert(idx, { issuer: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Year">
                  <input
                    type="text"
                    value={cert.year}
                    onChange={(e) => updateCert(idx, { year: e.target.value })}
                    className={adminMonoInputClass}
                  />
                </AdminField>
                <AdminField label="Category">
                  <input
                    type="text"
                    value={cert.category}
                    onChange={(e) =>
                      updateCert(idx, { category: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Verification / Proof URL">
                  <input
                    type="url"
                    value={cert.proofUrl}
                    onChange={(e) =>
                      updateCert(idx, { proofUrl: e.target.value })
                    }
                    className={adminMonoInputClass}
                  />
                </AdminField>
                <AdminField label="Button Label">
                  <input
                    type="text"
                    value={cert.proofLabel}
                    onChange={(e) =>
                      updateCert(idx, { proofLabel: e.target.value })
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <div className="md:col-span-2">
                  <AdminField label="Summary">
                    <textarea
                      rows={2}
                      value={cert.summary}
                      onChange={(e) =>
                        updateCert(idx, { summary: e.target.value })
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
