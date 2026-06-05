export function validate_vessel_name(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return 'Название судна должно содержать не менее 2 символов'
  }
  if (name.length > 100) {
    return 'Название судна не должно превышать 100 символов'
  }
  if (!/^[а-яА-ЯёЁa-zA-Z0-9\s\-]+$/.test(name)) {
    return 'Название содержит недопустимые символы. Разрешены буквы, цифры, пробелы и дефис'
  }
  return null
}
