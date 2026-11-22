/* 032
 * Lista os registros com paginacao e acoes de editar e excluir
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageResult } from '../types';
import { ResourceConfig } from '../config/resources';

/* 032.01
 * recebe ResourceConfig, tabela com oito registros por pagina, links Novo/Editar e
 * estados de carregamento, erro e vazio
 */
export function CrudPage({ title, endpoint, columns }: ResourceConfig) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  /* 032.02
   * Carrega a pagina atual e ajusta a paginacao se o ultimo registro da pagina for
   * excluido
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<PageResult<Record<string, unknown>>>(`/${endpoint}?page=${page}&limit=8`)
      .then(({ data }) => {
        if (cancelled) {
          return;
        }
        const totalPages = Math.max(1, data.totalPages);
        setPages(totalPages);
        if (page > totalPages) {
          setPage(totalPages);
          return;
        }
        setRows(data.data);
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
  }, [page, endpoint, version]);

  /* 032.03
   * pede confirmacao antes de excluir e recarrega a lista depois da exclusao
   */
  const remove = async (id: number) => {
    if (!confirm('Confirma a exclusão deste registro?')) {
      return;
    }
    setDeleting(id);
    setError('');
    try {
      await api.delete(`/${endpoint}/${id}`);
      setVersion((value) => value + 1);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  /* 032.04
   * Mostra o nome dos vinculos e troca os sublinhados dos status por espacos
   */
  const display = (value: unknown) =>
    value && typeof value === 'object'
      ? String(
          (
            value as {
              name?: string;
            }
          ).name ?? '—',
        )
      : String(value ?? '—').replace(/_/g, ' ');
  return (
    <section>
      <div className="page-heading list-heading">
        <div>
          <p className="eyebrow">CADASTROS</p>
          <h1>{title}</h1>
          <p className="page-description">
            Consulte e organize os registros cadastrados.
          </p>
        </div>
        <Link
          className="button-link"
          to={`/${endpoint}/new`}
        >
          Novo registro
        </Link>
      </div>
      {error && (
        <p
          role="alert"
          className="error"
        >
          {error}{' '}
          <button
            type="button"
            className="secondary small"
            onClick={() => setVersion((value) => value + 1)}
          >
            Tentar novamente
          </button>
        </p>
      )}
      <div className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  {columns.map((column) => (
                    <td key={column.key}>{display(row[column.key])}</td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <Link
                        className="button-link small secondary"
                        to={`/${endpoint}/${row.id}/edit`}
                      >
                        Editar
                      </Link>
                      <button
                        disabled={deleting !== null}
                        className="small danger"
                        onClick={() => void remove(Number(row.id))}
                      >
                        {deleting === row.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? (
          <p
            role="status"
            className="empty-state"
          >
            Carregando...
          </p>
        ) : (
          rows.length === 0 &&
          !error && (
            <p className="empty-state">
              Nenhum registro cadastrado. Clique em Novo registro para começar.
            </p>
          )
        )}
        <div className="pagination">
          <button
            className="secondary"
            disabled={loading || page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Anterior
          </button>
          <span>
            Página {page} de {pages}
          </span>
          <button
            className="secondary"
            disabled={loading || page >= pages}
            onClick={() => setPage((value) => value + 1)}
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
}
