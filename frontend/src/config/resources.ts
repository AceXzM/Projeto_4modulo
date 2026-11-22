/* 031
 * Define os campos, colunas e vinculos de cada cadastro
 */
export type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  relation?: string;
  maxLength?: number;
  options?: readonly string[];
};
export type ResourceConfig = {
  endpoint: string;
  title: string;
  fields: Field[];
  columns: {
    key: string;
    label: string;
  }[];
};
export const resources: ResourceConfig[] = [
  {
    endpoint: 'departments',
    title: 'Departamentos',
    fields: [
      {
        name: 'name',
        label: 'Nome',
        maxLength: 100,
      },
      {
        name: 'description',
        label: 'Descrição',
        required: false,
        maxLength: 500,
      },
    ],
    columns: [
      {
        key: 'name',
        label: 'Nome',
      },
      {
        key: 'description',
        label: 'Descrição',
      },
    ],
  },
  {
    endpoint: 'employees',
    title: 'Colaboradores',
    fields: [
      {
        name: 'name',
        label: 'Nome',
        maxLength: 120,
      },
      {
        name: 'email',
        label: 'E-mail',
        type: 'email',
        maxLength: 160,
      },
      {
        name: 'role',
        label: 'Cargo',
        maxLength: 80,
      },
      {
        name: 'departmentId',
        label: 'Departamento',
        required: false,
        relation: 'departments',
      },
    ],
    columns: [
      {
        key: 'name',
        label: 'Nome',
      },
      {
        key: 'email',
        label: 'E-mail',
      },
      {
        key: 'role',
        label: 'Cargo',
      },
      {
        key: 'department',
        label: 'Departamento',
      },
    ],
  },
  {
    endpoint: 'tasks',
    title: 'Tarefas',
    fields: [
      {
        name: 'title',
        label: 'Título',
        maxLength: 160,
      },
      {
        name: 'description',
        label: 'Descrição',
        required: false,
        maxLength: 10000,
      },
      {
        name: 'status',
        label: 'Status',
        options: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'],
      },
      {
        name: 'dueDate',
        label: 'Prazo',
        type: 'date',
        required: false,
      },
      {
        name: 'employeeId',
        label: 'Colaborador responsável',
        required: false,
        relation: 'employees',
      },
    ],
    columns: [
      {
        key: 'title',
        label: 'Título',
      },
      {
        key: 'status',
        label: 'Status',
      },
      {
        key: 'dueDate',
        label: 'Prazo',
      },
      {
        key: 'assignee',
        label: 'Responsável',
      },
    ],
  },
  {
    endpoint: 'assets',
    title: 'Ativos',
    fields: [
      {
        name: 'name',
        label: 'Nome',
        maxLength: 120,
      },
      {
        name: 'code',
        label: 'Código',
        maxLength: 60,
      },
      {
        name: 'category',
        label: 'Categoria',
        maxLength: 80,
      },
      {
        name: 'status',
        label: 'Status',
        options: ['DISPONIVEL', 'EM_USO', 'MANUTENCAO'],
      },
      {
        name: 'departmentId',
        label: 'Departamento',
        required: false,
        relation: 'departments',
      },
    ],
    columns: [
      {
        key: 'name',
        label: 'Nome',
      },
      {
        key: 'code',
        label: 'Código',
      },
      {
        key: 'category',
        label: 'Categoria',
      },
      {
        key: 'status',
        label: 'Status',
      },
      {
        key: 'department',
        label: 'Departamento',
      },
    ],
  },
];
