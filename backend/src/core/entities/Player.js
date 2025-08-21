/**
 * Player Entity - Representa un jugador de hockey
 * Dominio: Core/Entities
 */
export class Player {
  constructor({
    id = null,
    nombreCompleto,
    nombreCorto,
    numeroCamiseta = null,
    posicion = null,
    fotoUrl = null,
    activo = true,
    fechaCreacion = new Date()
  }) {
    this.id = id;
    this.nombreCompleto = nombreCompleto;
    this.nombreCorto = nombreCorto;
    this.numeroCamiseta = numeroCamiseta;
    this.posicion = posicion;
    this.fotoUrl = fotoUrl;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
  }

  /**
   * Posiciones válidas en hockey
   */
  static POSICIONES = ['Arquera', 'Defensora', 'Volante', 'Delantera'];

  /**
   * Valida si la posición es válida
   */
  isValidPosition() {
    return !this.posicion || Player.POSICIONES.includes(this.posicion);
  }

  /**
   * Valida el número de camiseta
   */
  isValidJerseyNumber() {
    if (!this.numeroCamiseta) return true; // Es opcional
    return Number.isInteger(this.numeroCamiseta) && this.numeroCamiseta >= 1 && this.numeroCamiseta <= 99;
  }

  /**
   * Valida los datos del jugador
   */
  validate() {
    const errors = [];

    if (!this.nombreCompleto || this.nombreCompleto.trim().length < 2) {
      errors.push('Nombre completo debe tener al menos 2 caracteres');
    }

    if (!this.nombreCorto || this.nombreCorto.trim().length < 1) {
      errors.push('Nombre corto es requerido');
    }

    if (this.nombreCorto && this.nombreCorto.length > 15) {
      errors.push('Nombre corto no puede exceder 15 caracteres');
    }

    if (!this.isValidJerseyNumber()) {
      errors.push('Número de camiseta debe estar entre 1 y 99');
    }

    if (!this.isValidPosition()) {
      errors.push(`Posición debe ser una de: ${Player.POSICIONES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toJSON() {
    return {
      id: this.id,
      nombreCompleto: this.nombreCompleto,
      nombreCorto: this.nombreCorto,
      numeroCamiseta: this.numeroCamiseta,
      posicion: this.posicion,
      fotoUrl: this.fotoUrl,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion
    };
  }

  /**
   * Crea una instancia desde datos de la base de datos
   */
  static fromDatabase(data) {
    return new Player({
      id: data.id,
      nombreCompleto: data.nombre_completo,
      nombreCorto: data.nombre_corto,
      numeroCamiseta: data.numero_camiseta,
      posicion: data.posicion,
      fotoUrl: data.foto_url,
      activo: data.activo,
      fechaCreacion: data.fecha_creacion
    });
  }

  /**
   * Convierte la entidad para insertar en la base de datos
   */
  toDatabaseInsert() {
    return {
      nombre_completo: this.nombreCompleto,
      nombre_corto: this.nombreCorto,
      numero_camiseta: this.numeroCamiseta,
      posicion: this.posicion,
      foto_url: this.fotoUrl,
      activo: this.activo
    };
  }
}