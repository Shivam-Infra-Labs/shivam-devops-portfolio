'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type {
  PortfolioData,
  SocialPlatform,
  StackIconKey,
} from '@/src/types/portfolio';
import {
  AdminField,
  ItemActionControls,
  adminInputClass,
  adminMonoInputClass,
  moveArrayItem,
} from './AdminShared';
import { ProfileAvatar } from '../ProfileAvatar';

const STACK_ICON_OPTIONS: StackIconKey[] = [
  'docker',
  'kubernetes',
  'github-actions',
  'linux',
  'nginx',
  'prometheus',
  'cisco',
];

const SOCIAL_PLATFORM_OPTIONS: SocialPlatform[] = [
  'github',
  'linkedin',
  'email',
  'upwork',
  'fiverr',
  'x',
  'custom',
];

export function IdentityHeroTab({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (next: PortfolioData) => void;
}) {
  const { profile, coreStack } = data;

  const updateProfile = (patch: Partial<typeof profile>) => {
    onChange({
      ...data,
      profile: {
        ...profile,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Identity & Hero Fields */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Identity & Hero</h2>
            <p className="text-xs text-slate-400">
              Changes reflect immediately on the Hero, Navbar, About, and Resume pages.
            </p>
          </div>
          <ProfileAvatar
            src={profile.photoUrl}
            alt={profile.name}
            monogram={profile.monogram}
            size="md"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AdminField label="Full Name">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Fallback Monogram (2–3 chars)">
            <input
              type="text"
              maxLength={4}
              value={profile.monogram}
              onChange={(e) => updateProfile({ monogram: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField
            label="Profile Photo URL"
            hint="Use /profile.jpg or any HTTPS image URL. Falls back to monogram if unreachable."
          >
            <input
              type="text"
              value={profile.photoUrl}
              onChange={(e) => updateProfile({ photoUrl: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>

          <AdminField label="Location">
            <input
              type="text"
              value={profile.location}
              onChange={(e) => updateProfile({ location: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Headline">
            <input
              type="text"
              value={profile.headline}
              onChange={(e) => updateProfile({ headline: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Availability Line">
            <input
              type="text"
              value={profile.availabilityLine}
              onChange={(e) => updateProfile({ availabilityLine: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <div className="md:col-span-2">
            <AdminField label="Hero Subheadline (1-sentence summary)">
              <textarea
                rows={2}
                value={profile.subheadline}
                onChange={(e) => updateProfile({ subheadline: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>
          </div>

          <AdminField label="Availability Status Badge Text">
            <input
              type="text"
              value={profile.availabilityBadge}
              onChange={(e) => updateProfile({ availabilityBadge: e.target.value })}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Availability Pill Visibility">
            <button
              type="button"
              onClick={() =>
                updateProfile({ availabilityActive: !profile.availabilityActive })
              }
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                profile.availabilityActive !== false
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              <span>
                {profile.availabilityActive !== false
                  ? 'Showing Availability Status on Hero'
                  : 'Availability Status Hidden'}
              </span>
            </button>
          </AdminField>
        </div>
      </div>

      {/* Social & Freelance Links */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Social & Freelance Links
            </h2>
            <p className="text-xs text-slate-400">
              Manage GitHub, LinkedIn, Email, Upwork, Fiverr, X, or custom links.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateProfile({
                socialLinks: [
                  ...(profile.socialLinks ?? []),
                  {
                    id: `link-${Date.now()}`,
                    label: 'Upwork',
                    url: 'https://www.upwork.com/',
                    platform: 'upwork',
                    visible: true,
                  },
                ],
              })
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Link</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-5 border-b border-slate-800/80 pb-5">
          <AdminField label="Primary Email">
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>
          <AdminField label="Primary GitHub URL">
            <input
              type="url"
              value={profile.githubUrl}
              onChange={(e) => updateProfile({ githubUrl: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>
          <AdminField label="Primary LinkedIn URL">
            <input
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
              className={adminMonoInputClass}
            />
          </AdminField>
        </div>

        <div className="space-y-3">
          {(profile.socialLinks ?? []).map((link, idx) => (
            <div
              key={link.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-cyan-300">
                  Link #{idx + 1} · {link.label}
                </span>
                <ItemActionControls
                  index={idx}
                  total={(profile.socialLinks ?? []).length}
                  visible={link.visible}
                  onToggleVisible={() => {
                    const next = [...profile.socialLinks];
                    next[idx] = { ...link, visible: !link.visible };
                    updateProfile({ socialLinks: next });
                  }}
                  onMoveUp={() =>
                    updateProfile({
                      socialLinks: moveArrayItem(profile.socialLinks, idx, -1),
                    })
                  }
                  onMoveDown={() =>
                    updateProfile({
                      socialLinks: moveArrayItem(profile.socialLinks, idx, 1),
                    })
                  }
                  onDelete={() =>
                    updateProfile({
                      socialLinks: profile.socialLinks.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <AdminField label="Label">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...profile.socialLinks];
                      next[idx] = { ...link, label: e.target.value };
                      updateProfile({ socialLinks: next });
                    }}
                    className={adminInputClass}
                  />
                </AdminField>

                <AdminField label="Platform">
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const next = [...profile.socialLinks];
                      next[idx] = {
                        ...link,
                        platform: e.target.value as SocialPlatform,
                      };
                      updateProfile({ socialLinks: next });
                    }}
                    className={adminInputClass}
                  >
                    {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </AdminField>

                <AdminField label="URL">
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...profile.socialLinks];
                      next[idx] = { ...link, url: e.target.value };
                      updateProfile({ socialLinks: next });
                    }}
                    className={adminMonoInputClass}
                  />
                </AdminField>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Stack Icon Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Core Stack Icon Strip
            </h2>
            <p className="text-xs text-slate-400">
              Reorder, toggle visibility, edit tooltips, or add stack badges under the Hero.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                coreStack: [
                  ...coreStack,
                  {
                    id: `stack-${Date.now()}`,
                    name: 'Terraform',
                    category: 'IaC',
                    tooltip: 'Declarative infrastructure provisioning',
                    iconKey: 'linux',
                    visible: true,
                  },
                ],
              })
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Stack Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {coreStack.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-cyan-300">
                  {item.name} · {item.category}
                </span>
                <ItemActionControls
                  index={idx}
                  total={coreStack.length}
                  visible={item.visible !== false}
                  onToggleVisible={() => {
                    const next = [...coreStack];
                    next[idx] = { ...item, visible: item.visible === false };
                    onChange({ ...data, coreStack: next });
                  }}
                  onMoveUp={() =>
                    onChange({
                      ...data,
                      coreStack: moveArrayItem(coreStack, idx, -1),
                    })
                  }
                  onMoveDown={() =>
                    onChange({
                      ...data,
                      coreStack: moveArrayItem(coreStack, idx, 1),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...data,
                      coreStack: coreStack.filter((_, i) => i !== idx),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <AdminField label="Name">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const next = [...coreStack];
                      next[idx] = { ...item, name: e.target.value };
                      onChange({ ...data, coreStack: next });
                    }}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Category">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => {
                      const next = [...coreStack];
                      next[idx] = { ...item, category: e.target.value };
                      onChange({ ...data, coreStack: next });
                    }}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Icon Key">
                  <select
                    value={item.iconKey}
                    onChange={(e) => {
                      const next = [...coreStack];
                      next[idx] = {
                        ...item,
                        iconKey: e.target.value as StackIconKey,
                      };
                      onChange({ ...data, coreStack: next });
                    }}
                    className={adminInputClass}
                  >
                    {STACK_ICON_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Tooltip">
                  <input
                    type="text"
                    value={item.tooltip}
                    onChange={(e) => {
                      const next = [...coreStack];
                      next[idx] = { ...item, tooltip: e.target.value };
                      onChange({ ...data, coreStack: next });
                    }}
                    className={adminInputClass}
                  />
                </AdminField>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
