/* 028
 * acrescenta userId ao tipo Request para guardar o ID que veio do token
 */
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
export {};
