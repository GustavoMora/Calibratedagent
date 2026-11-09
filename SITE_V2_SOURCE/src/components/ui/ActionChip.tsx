import type { Action } from '../../domain/decisionModel';
import { useT } from '../../app/i18n';

export const ACTION_ICON: Record<Action, string> = { act: '✓', ask: '?', abstain: '⊘' };

export function ActionChip({ action }: { action: Action }) {
  const t = useT();
  return (
    <span className="act-chip" data-a={action}>
      <span aria-hidden="true">{ACTION_ICON[action]}</span>
      {t.act[action]}
    </span>
  );
}
