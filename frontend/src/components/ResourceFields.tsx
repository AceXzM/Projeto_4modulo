/* 034
 * Monta os campos do formulario a partir da configuracao do cadastro
 */
import { Field } from '../config/resources';
import { RelationSelect } from './RelationSelect';

/* 034.01
 * recebe os campos e seus valores e monta inputs, descricao, status e seletores de
 * vinculo
 */
export function ResourceFields({
  fields,
  values,
  onChange,
}: {
  fields: Field[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <>
      {fields.map((field) =>
        field.relation ? (
          <RelationSelect
            key={field.name}
            endpoint={field.relation}
            label={field.label}
            value={values[field.name] ?? ''}
            required={field.required !== false}
            onChange={(value) => onChange(field.name, value)}
          />
        ) : (
          <label
            key={field.name}
            className={field.name === 'description' ? 'field-wide' : undefined}
          >
            <span>
              {field.label}
              {field.required === false && (
                <span className="field-optional"> (opcional)</span>
              )}
            </span>
            {field.options ? (
              <select
                required
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              >
                {field.options.map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            ) : field.name === 'description' ? (
              <textarea
                maxLength={field.maxLength}
                rows={3}
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            ) : (
              <input
                required={field.required !== false}
                maxLength={field.maxLength}
                type={field.type ?? 'text'}
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            )}
          </label>
        ),
      )}
    </>
  );
}
