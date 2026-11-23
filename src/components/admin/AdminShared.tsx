import React from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from 'lucide-react';

export function moveArrayItem<T>(
  list: T[],
  index: number,
  direction: -1 | 1
): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-200">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export const adminInputClass =
  'block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25';

export const adminMonoInputClass =
  'block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25';

export function ItemActionControls({
  index,
  total,
  visible,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  index: number;
  total: number;
  visible?: boolean;
  onToggleVisible?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {typeof visible === 'boolean' && onToggleVisible && (
        <button
          type="button"
          onClick={onToggleVisible}
          title={visible ? 'Hide from public site' : 'Show on public site'}
          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
            visible
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {visible ? (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{visible ? 'Visible' : 'Hidden'}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onMoveUp}
        disabled={index === 0}
        aria-label="Move item up"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white disabled:opacity-35"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onMoveDown}
        disabled={index === total - 1}
        aria-label="Move item down"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white disabled:opacity-35"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete item"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500/25"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
