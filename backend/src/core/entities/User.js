/**
 * User Entity - Representa un entrenador en el sistema
 * Dominio: Core/Entities
 */
export class User {
  constructor({
    id = null,
    email,
    passwordHash,
    nombreCompleto,
    cuitCuil = null,
    enPeriodoPrueba = true,
    fechaInicioPrueba = new Date(),
    fechaFinPrueba = null,
    suscripcionActiva = false,
    activo = true,
    fechaCreacion = new Date()
  }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.nombreCompleto = nombreCompleto;
    this.cuitCuil = cuitCuil;
    this.enPeriodoPrueba = enPeriodoPrueba;
    this.fechaInicioPrueba = fechaInicioPrueba;
    this.fechaFinPrueba = fechaFinPrueba || this.calculateTrialEndDate();
    this.suscripcionActiva = suscripcionActiva;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
  }

  /**
   * Calcula la fecha de fin del período de prueba (30 días)
   */
  calculateTrialEndDate() {
    const endDate = new Date(this.fechaInicioPrueba);
    endDate.setDate(endDate.getDate() + 30);
    return endDate;
  }

  /**
   * Verifica si el usuario está en período de prueba válido
   */
  isInValidTrialPeriod() {
    if (!this.enPeriodoPrueba) return false;
    return new Date() <= this.fechaFinPrueba;
  }

  /**
   * Verifica si el usuario puede crear equipos
   */
  canCreateTeams() {
    return this.isInValidTrialPeriod() || this.suscripcionActiva;
  }

  /**
   * Activa la suscripción del usuario
   */
  activateSubscription() {
    this.suscripcionActiva = true;
    this.enPeriodoPrueba = false;
  }

  /**
   * Cancela la suscripción del usuario
   */
  cancelSubscription() {
    this.suscripcionActiva = false;
  }

  /**
   * Valida el email del usuario
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida el CUIT/CUIL argentino
   */
  static isValidCuitCuil(cuitCuil) {
    if (!cuitCuil) return true; // Es opcional
    
    // Remover guiones y espacios
    const cleanCuit = cuitCuil.replace(/[-\s]/g, '');
    
    // Debe tener 11 dígitos
    if (!/^\d{11}$/.test(cleanCuit)) return false;
    
    // Validar dígito verificador
    const digits = cleanCuit.split('').map(Number);
    const checkDigit = digits.pop();
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    const sum = digits.reduce((acc, digit, index) => acc + digit * multipliers[index], 0);
    const remainder = sum % 11;
    const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return checkDigit === calculatedCheckDigit;
  }

  /**
   * Valida los datos del usuario
   */
  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email es requerido');
    } else if (!User.isValidEmail(this.email)) {
      errors.push('Email inválido');
    }

    if (!this.passwordHash) {
      errors.push('Password es requerido');
    }

    if (!this.nombreCompleto || this.nombreCompleto.trim().length < 2) {
      errors.push('Nombre completo debe tener al menos 2 caracteres');
    }

    if (this.cuitCuil && !User.isValidCuitCuil(this.cuitCuil)) {
      errors.push('CUIT/CUIL inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la entidad a objeto plano (sin password)
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      nombreCompleto: this.nombreCompleto,
      cuitCuil: this.cuitCuil,
      enPeriodoPrueba: this.enPeriodoPrueba,
      fechaInicioPrueba: this.fechaInicioPrueba,
      fechaFinPrueba: this.fechaFinPrueba,
      suscripcionActiva: this.suscripcionActiva,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion,
      canCreateTeams: this.canCreateTeams(),
      isInValidTrialPeriod: this.isInValidTrialPeriod()
    };
  }

  /**
   * Crea una instancia desde datos de la base de datos
   */
  static fromDatabase(data) {
    return new User({
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      nombreCompleto: data.nombre_completo,
      cuitCuil: data.cuit_cuil,
      enPeriodoPrueba: data.en_periodo_prueba,
      fechaInicioPrueba: data.fecha_inicio_prueba,
      fechaFinPrueba: data.fecha_fin_prueba,
      suscripcionActiva: data.suscripcion_activa,
      activo: data.activo,
      fechaCreacion: data.fecha_creacion
    });
  }

  /**
   * Convierte la entidad para insertar en la base de datos
   */
  toDatabaseInsert() {
    return {
      email: this.email,
      password_hash: this.passwordHash,
      nombre_completo: this.nombreCompleto,
      cuit_cuil: this.cuitCuil,
      en_periodo_prueba: this.enPeriodoPrueba,
      fecha_inicio_prueba: this.fechaInicioPrueba,
      fecha_fin_prueba: this.fechaFinPrueba,
      suscripcion_activa: this.suscripcionActiva,
      activo: this.activo
    };
  }
}