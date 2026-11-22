/* 033
 * formulario usado para criar ou editar registros dos quatro cadastros
 */
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ResourceConfig } from '../config/resources';
import { ResourceFields } from '../components/ResourceFields';

/* 033.01
 * Recebe a configuracao do cadastro e usa o ID da rota quando o formulario esta em
 * edicao
 */
export function ResourceFormPage({
  config,
  editing = false,
}: {
  config: ResourceConfig;
  editing?: boolean;
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  /* 033.02
   * preenche os valores iniciais com a primeira opcao de status ou texto vazio
   */
  const defaults = () =>
    Object.fromEntries(
      config.fields.map((field) => [field.name, field.options?.[0] ?? '']),
    );
  const [form, setForm] = useState<Record<string, string>>(defaults);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [found, setFound] = useState(!editing);

  /* 033.03
   * Busca os dados pelo ID para preencher o formulario de edicao
   */
  useEffect(() => {
    let cancelled = false;
    if (!editing) {
      return;
    }
    setLoading(true);
    setFound(false);
    setError('');
    api
      .get<Record<string, unknown>>(`/${config.endpoint}/${id}`)
      .then(({ data }) => {
        if (cancelled) {
          return;
        }
        setForm(
          Object.fromEntries(
            config.fields.map((field) => [
              field.name,
              String(data[field.name] ?? field.options?.[0] ?? ''),
            ]),
          ),
        );
        setFound(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setError((error as Error).message);
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
  }, [config, editing, id]);

  /* 033.04
   * valida os campos obrigatorios, prepara os vinculos e envia o cadastro ou a edicao para
   * a API
   */
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = form[field.name] ?? '';
      if (field.required !== false && !value.trim()) {
        setError(`Preencha ${field.label.toLowerCase()}.`);
        return;
      }
      payload[field.name] = field.relation
        ? value
          ? Number(value)
          : null
        : value.trim() || null;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/${config.endpoint}/${id}`, payload);
      } else {
        await api.post(`/${config.endpoint}`, payload);
      }
      navigate(`/${config.endpoint}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">{config.title.toUpperCase()}</p>
        <h1>{editing ? 'Editar registro' : 'Novo registro'}</h1>
        <Link to={`/${config.endpoint}`}>Voltar à listagem</Link>
      </div>
      {error && (
        <p
          className="error"
          role="alert"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Carregando registro...</p>
      ) : (
        found && (
          <form
            className="panel form-grid"
            onSubmit={submit}
          >
            <div className="form-heading">
              <h3>{config.title}</h3>
              <p>Preencha os campos. Os vínculos podem ser pesquisados pelo nome.</p>
            </div>
            <ResourceFields
              fields={config.fields}
              values={form}
              onChange={(name, value) =>
                setForm((previous) => ({
                  ...previous,
                  [name]: value,
                }))
              }
            />
            <div className="actions">
              <button disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar registro'}
              </button>
              <Link
                className="button-link secondary"
                to={`/${config.endpoint}`}
              >
                Cancelar
              </Link>
            </div>
          </form>
        )
      )}
    </section>
  );
}
