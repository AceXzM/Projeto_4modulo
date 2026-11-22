/* 043
 * Mostra o total de departamentos, colaboradores, tarefas e ativos
 */
import {useEffect,useState} from 'react';import {api} from '../services/api';

/* 043.01
 * Monta os cartoes com o total de registros de cada cadastro
 */
export function Dashboard(){const [counts,setCounts]=useState({departments:0,employees:0,tasks:0,assets:0});
 
 /* 043.02
  * Busca os quatro totais ao abrir o painel e mantém os valores iniciais se a consulta falhar
  */
 useEffect(()=>{const endpoints=['departments','employees','tasks','assets'] as const;Promise.all(endpoints.map(e=>api.get(`/${e}?page=1&limit=1`))).then(results=>setCounts({departments:results[0].data.total,employees:results[1].data.total,tasks:results[2].data.total,assets:results[3].data.total})).catch(()=>undefined);},[]);
 const cards=[['Departamentos',counts.departments],['Colaboradores',counts.employees],['Tarefas',counts.tasks],['Ativos',counts.assets]];
 return <section><p className="eyebrow">PAINEL</p><h1>Visão geral</h1><p className="muted">Acompanhe os principais cadastros e rotinas da organização.</p><div className="stats">{cards.map(([label,value])=><article className="stat" key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="panel welcome"><h2>Bem-vindo ao Droz Control</h2><p>Centralize informações internas, organize responsabilidades e acompanhe tarefas em um só lugar.</p></div></section>;
}
