/* 044
 * define os tipos dos dados usados pelo frontend
 */
export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
}
export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export type Department = {
  id: number;
  name: string;
  description: string | null;
};
export type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number | null;
};
export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  dueDate: string | null;
  employeeId: number | null;
};
export type Asset = {
  id: number;
  name: string;
  code: string;
  category: string;
  status: 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO';
  departmentId: number | null;
};
