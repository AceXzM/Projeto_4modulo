/* 035
 * Lista departamentos ou colaboradores e permite buscar antes de escolher o vinculo
 */
import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { PageResult } from '../types';

export type RelationOption = {
  id: number;
  name: string;
  email?: string;
};
type Props = {
  endpoint: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

/* 035.01
 * remove acentos e converte o texto para minusculas para facilitar a busca
 */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();

/* 035.02
 * Carrega todas as paginas de opcoes em lotes de 50 e ordena os nomes
 */
export async function loadRelationOptions(endpoint: string): Promise<RelationOption[]> {
  const rows: RelationOption[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const { data } = await api.get<PageResult<RelationOption>>(
      `/${endpoint}?page=${page}&limit=50`,
    );
    rows.push(...data.data);
    totalPages = data.totalPages;
    page++;
  } while (page <= totalPages);
  return rows.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/* 035.03
 * mostra a lista pesquisavel com selecao, limpeza do vinculo e mensagens de carregamento
 * e erro
 */
export function RelationSelect({
  endpoint,
  label,
  value,
  onChange,
  required = false,
}: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<RelationOption[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  /* 035.04
   * Carrega as opcoes ao mudar o cadastro ou tentar novamente depois de um erro
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setOptions([]);
    setError('');
    loadRelationOptions(endpoint)
      .then((rows) => {
        if (!cancelled) {
          setOptions(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Não foi possível carregar a lista.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, retry]);

  const filtered = useMemo(
    () =>
      options.filter((option) =>
        normalize(`${option.name} ${option.email ?? ''}`).includes(
          normalize(query.trim()),
        ),
      ),
    [options, query],
  );
  const selected = options.find((option) => String(option.id) === value);
  const selectedText = selected
    ? `${selected.name}${selected.email ? ` (${selected.email})` : ''}`
    : value
      ? 'Vínculo atual indisponível'
      : '';

  /* 035.05
   * envia o ID da opcao escolhida e fecha a lista
   */
  const choose = (option: RelationOption) => {
    onChange(String(option.id));
    setOpen(false);
    setQuery('');
    setActive(-1);
  };

  /* 035.06
   * Usa as setas para navegar, Enter para selecionar e Escape para fechar a lista
   */
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((index) =>
        filtered.length === 0
          ? -1
          : event.key === 'ArrowDown'
            ? Math.min(index + 1, filtered.length - 1)
            : Math.max(index - 1, 0),
      );
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (active >= 0 && filtered[active]) {
        choose(filtered[active]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      setQuery('');
      setActive(-1);
    }
  };

  /* 035.07
   * mantem a opcao selecionada pelo teclado visivel na lista
   */
  useEffect(() => {
    if (active >= 0) {
      document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({
        block: 'nearest',
      });
    }
  }, [active, id]);

  return (
    <div
      className="relation-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery('');
          setActive(-1);
        }
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div className="relation-control">
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={
            open && active >= 0 ? `${id}-option-${active}` : undefined
          }
          aria-describedby={`${id}-help`}
          autoComplete="off"
          required={required && !value}
          placeholder={
            loading ? 'Carregando opções...' : 'Digite para buscar ou escolha na lista'
          }
          value={open ? query : selectedText}
          onFocus={() => {
            setOpen(true);
            setQuery('');
            setActive(-1);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(-1);
            onChange('');
          }}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button
            type="button"
            className="relation-clear"
            aria-label={`Remover ${label.toLowerCase()}`}
            onClick={() => {
              onChange('');
              setQuery('');
              input.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>
      <small
        id={`${id}-help`}
        className="muted"
      >
        {selected
          ? `Selecionado: ${selected.name}`
          : required
            ? 'Escolha um registro da lista.'
            : 'Opcional. Escolha um registro para vincular.'}
      </small>
      {open && (
        <div className="relation-dropdown">
          {loading ? (
            <p role="status">Carregando...</p>
          ) : error ? (
            <div role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="secondary"
                onClick={() => setRetry((n) => n + 1)}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <ul
                id={`${id}-list`}
                role="listbox"
                aria-label={label}
              >
                {filtered.map((option, index) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      id={`${id}-option-${index}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected={String(option.id) === value}
                      className={
                        index === active ? 'relation-option active' : 'relation-option'
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(option)}
                    >
                      <span>{option.name}</span>
                      {option.email && <small>{option.email}</small>}
                    </button>
                  </li>
                ))}
              </ul>
              {filtered.length === 0 && (
                <p role="status">
                  {options.length
                    ? 'Nenhum resultado para esta busca.'
                    : 'Nenhum registro cadastrado. Cadastre um primeiro.'}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
