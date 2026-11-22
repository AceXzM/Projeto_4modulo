/* 011
 * Valida e-mail, senha e CPF antes de enviar o formulario
 */

/* 011.01
 * confere o formato basico do e-mail
 */
export const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/* 011.02
 * Confere se a senha tem pelo menos 8 caracteres, maiuscula, minuscula e numero
 */
export const passwordStrong = (value: string) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

/* 011.03
 * remove a mascara e confere os digitos do CPF, rejeitando sequencias repetidas
 */
export const validCpf = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  /* 011.04
   * Calcula um digito verificador do CPF usando a soma dos numeros com seus pesos
   */
  const digit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return digit(9) === Number(digits[9]) && digit(10) === Number(digits[10]);
};
