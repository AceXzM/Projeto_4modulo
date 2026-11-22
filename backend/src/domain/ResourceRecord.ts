/* 009
 * Define e valida os campos aceitos em cada cadastro
 */
import { AppError } from '../utils/AppError';
import { validEmail } from './validation';

type FieldRule = {
  required?: boolean;
  max?: number;
  choices?: readonly string[];
  relation?: boolean;
  date?: boolean;
  email?: boolean;
  default?: string;
};
export const resourceSchemas: Record<string, Record<string, FieldRule>> = {
  departments: {
    name: {
      required: true,
      max: 100,
    },
    description: {
      max: 500,
    },
  },
  employees: {
    name: {
      required: true,
      max: 120,
    },
    email: {
      required: true,
      max: 160,
      email: true,
    },
    role: {
      required: true,
      max: 80,
    },
    departmentId: {
      relation: true,
    },
  },
  tasks: {
    title: {
      required: true,
      max: 160,
    },
    description: {
      max: 10000,
    },
    status: {
      required: true,
      choices: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'],
      default: 'PENDENTE',
    },
    dueDate: {
      date: true,
    },
    employeeId: {
      relation: true,
    },
  },
  assets: {
    name: {
      required: true,
      max: 120,
    },
    code: {
      required: true,
      max: 60,
    },
    category: {
      required: true,
      max: 80,
    },
    status: {
      required: true,
      choices: ['DISPONIVEL', 'EM_USO', 'MANUTENCAO'],
      default: 'DISPONIVEL',
    },
    departmentId: {
      relation: true,
    },
  },
};

/* 009.01
 * confere se o corpo recebido e um objeto JSON e rejeita valores nulos e listas
 */
export function bodyObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Envie um objeto JSON válido.');
  }
  return input as Record<string, unknown>;
}

/*
 * Valida os dados antes de guardar e devolve uma copia protegida
 */
export class ResourceRecord {
  private readonly values: Record<string, unknown> = {};

  /* 009.02
   * confere os campos permitidos, obrigatorios, limites, status, datas e IDs dos vinculos
   */
  constructor(resource: string, input: unknown) {
    const schema = resourceSchemas[resource];
    if (!schema) {
      throw new AppError('Recurso inválido.');
    }
    const data = bodyObject(input);
    const extra = Object.keys(data).find(
      (key) => !Object.prototype.hasOwnProperty.call(schema, key),
    );
    if (extra) {
      throw new AppError(`Campo não permitido: ${extra}.`);
    }
    for (const [key, rule] of Object.entries(schema)) {
      const value = data[key] ?? rule.default;
      if (value === undefined || value === null || value === '') {
        if (rule.required) {
          throw new AppError(`O campo ${key} é obrigatório.`);
        }
        this.values[key] = null;
        continue;
      }
      if (rule.relation) {
        if (
          !['string', 'number'].includes(typeof value) ||
          !Number.isSafeInteger(Number(value)) ||
          Number(value) < 1
        ) {
          throw new AppError(`Vínculo inválido: ${key}.`);
        }
        this.values[key] = Number(value);
        continue;
      }
      if (typeof value !== 'string' || !value.trim()) {
        throw new AppError(`Valor inválido: ${key}.`);
      }
      const text = value.trim();
      if (rule.max && text.length > rule.max) {
        throw new AppError(`${key}: máximo de ${rule.max} caracteres.`);
      }
      if (rule.email && !validEmail(text)) {
        throw new AppError('E-mail inválido.');
      }
      if (rule.choices && !rule.choices.includes(text)) {
        throw new AppError(`Status inválido: ${text}.`);
      }
      if (
        rule.date &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(text) ||
          !Number.isFinite(Date.parse(text)) ||
          new Date(text).toISOString().slice(0, 10) !== text)
      ) {
        throw new AppError('Data inválida. Use AAAA-MM-DD.');
      }
      this.values[key] = rule.email ? text.toLowerCase() : text;
    }
  }

  /* 009.03
   * Devolve uma copia dos dados validados sem permitir que ela seja alterada
   */
  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...this.values,
    });
  }
}
