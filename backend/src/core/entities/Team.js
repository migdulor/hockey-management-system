/**
 * Team Entity - Representa un equipo de hockey
 * Dominio: Core/Entities
 */
export class Team {
  constructor({
    id = null,
    usuarioId,
    clubId,
    nombre,
    division,
    categoria,
    temporada,
    activo = true,
    fechaCreacion = new Date(),
    fechaEliminacion = null,
    eliminado = false
  }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.clubId = clubId;
    this.nombre = nombre;
    this.division = division;
    this.categoria = categoria;
    this.temporada = temporada;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fechaEliminacion = fechaEliminacion;
    this.eliminado = eliminado;
  }

  /**
   * Divisiones válidas de hockey
   */
  static DIVISIONES = {
    FEMENINO: ['S14', 'S16', 'S19', 'Inter', 'Primera', 'Pre intermedia', 'Segunda', 'Mamis'],
    MASCULINO: ['S15', 'S19', 'Inter', 'Primera', 'Papis']
  };

  /**
   * Categorías válidas
   */
  static CATEGORIAS = ['Femenino', 'Masculino'];

  /**
   * Valida si la división es válida para la categoría
   */
  isValidDivision() {
    const divisiones = Team.DIVISIONES[this.categoria.toUpperCase()];
    return divisiones && divisiones.includes(this.division);
  }

  /**
   * Marca el equipo como eliminado (soft delete)
   */
  markAsDeleted() {
    this.eliminado = true;
    this.activo = false;
    this.fechaEliminacion = new Date();
  }

  /**
   * Restaura el equipo eliminado
   */
  restore() {
    this.eliminado = false;
    this.activo = true;
    this.fechaEliminacion = null;
  }

  /**
   * Valida los datos del equipo
   */
  validate() {
    const errors = [];

    if (!this.usuarioId) {
      errors.push('Usuario ID es requerido');
    }

    if (!this.clubId) {
      errors.push('Club ID es requerido');
    }

    if (!this.nombre || this.nombre.trim().length < 2) {
      errors.push('Nombre del equipo debe tener al menos 2 caracteres');
    }

    if (!this.categoria || !Team.CATEGORIAS.includes(this.categoria)) {
      errors.push(`Categoría debe ser una de: ${Team.CATEGORIAS.join(', ')}`);
    }

    if (!this.division) {
      errors.push('División es requerida');
    } else if (!this.isValidDivision()) {
      const validDivisions = Team.DIVISIONES[this.categoria?.toUpperCase()] || [];
      errors.push(`División '${this.division}' no válida para categoría '${this.categoria}'. Divisiones válidas: ${validDivisions.join(', ')}`);
    }

    if (!this.temporada || this.temporada.trim().length < 4) {
      errors.push('Temporada es requerida (ej: 2024)');
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
      usuarioId: this.usuarioId,
      clubId: this.clubId,
      nombre: this.nombre,
      division: this.division,
      categoria: this.categoria,
      temporada: this.temporada,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion,
      fechaEliminacion: this.fechaEliminacion,
      eliminado: this.eliminado
    };
  }

  /**
   * Crea una instancia desde datos de la base de datos
   */
  static fromDatabase(data) {
    return new Team({
      id: data.id,
      usuarioId: data.usuario_id,
      clubId: data.club_id,
      nombre: data.nombre,
      division: data.division,
      categoria: data.categoria,
      temporada: data.temporada,
      activo: data.activo,
      fechaCreacion: data.fecha_creacion,
      fechaEliminacion: data.fecha_eliminacion,
      eliminado: data.eliminado
    });
  }

  /**
   * Convierte la entidad para insertar en la base de datos
   */
  toDatabaseInsert() {
    return {
      usuario_id: this.usuarioId,
      club_id: this.clubId,
      nombre: this.nombre,
      division: this.division,
      categoria: this.categoria,
      temporada: this.temporada,
      activo: this.activo,
      eliminado: this.eliminado
    };
  }
}