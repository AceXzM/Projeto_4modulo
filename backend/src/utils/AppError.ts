/* 014
 * erro da aplicacao com mensagem, status HTTP e codigo
 */
export class AppError extends Error {
  
  /* 014.01
   * mensagem do erro e permite definir o status HTTP e o codigo da resposta
   */
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = 'APPLICATION_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}
