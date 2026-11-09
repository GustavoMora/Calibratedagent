import { dataErrors } from '../../data';
import { useT } from '../../app/i18n';

/** Si los datos declarativos tienen errores, se informan de forma visible (nunca en silencio). */
export function DataErrors() {
  const t = useT();
  if (dataErrors.length === 0) return null;
  return (
    <div role="alert" className="wrap" style={{ paddingTop: 'calc(var(--header-h) + 16px)' }}>
      <div className="card" style={{ padding: 16, borderColor: 'var(--danger)' }}>
        <strong>{t.dataErrorTitle}</strong>
        <ul>
          {dataErrors.map((e) => (
            <li key={e} className="mono note">
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
