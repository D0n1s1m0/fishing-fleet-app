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

export function validate_coordinates(lat: number, lng: number): string | null {
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return 'Широта должна быть числом от -90 до 90 градусов'
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return 'Долгота должна быть числом от -180 до 180 градусов'
  }
  return null
}

export function validate_password(password: string): string | null {
  if (!password || password.length < 3) {
    return 'Пароль должен содержать не менее 3 символов'
  }
  if (password.length > 50) {
    return 'Пароль не должен превышать 50 символов'
  }
  return null
}

export function validate_email(email: string): string | null {
  if (!email || !email.includes('@') || !email.includes('.')) {
    return 'Введите корректный адрес электронной почты'
  }
  return null
}

export function validate_required_field(value: string, field_name: string): string | null {
  if (!value || value.trim().length === 0) {
    return `Поле "${field_name}" обязательно для заполнения`
  }
  return null
}

export function validate_number_range(value: number, min: number, max: number, field_name: string): string | null {
  if (isNaN(value)) {
    return `Поле "${field_name}" должно быть числом`
  }
  if (value < min || value > max) {
    return `Значение поля "${field_name}" должно быть от ${min} до ${max}`
  }
  return null
}
