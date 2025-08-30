// Importar desde los archivos compilados
const { Player } = await import('../../core/entities/Player.js');
const { PlayerRepository } = await import('../../core/repositories/PlayerRepository.js');
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
    success: number;
    errors: ImportError[];
    total: number;
}

export interface ImportError {
    row: number;
    field?: string;
    message: string;
    data?: any;
}

export interface PlayerImportData {
    name: string;
    nickname?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    position?: string;
    teamId?: string;
    emergencyContact?: string;
    medicalInfo?: string;
    active?: boolean;
}

export class PlayerImportService {
    constructor(private playerRepository: PlayerRepository) {}

    async importPlayers(playersData: PlayerImportData[]): Promise<ImportResult> {
        const result: ImportResult = {
            success: 0,
            errors: [],
            total: playersData.length
        };

        for (let i = 0; i < playersData.length; i++) {
            const playerData = playersData[i];
            try {
                const validationErrors = this.validatePlayerData(playerData, i + 1);
                if (validationErrors.length > 0) {
                    result.errors.push(...validationErrors);
                    continue;
                }

                const player = this.createPlayerFromData(playerData);
                await this.playerRepository.create(player);
                result.success++;
            } catch (error) {
                result.errors.push({
                    row: i + 1,
                    message: `Error al crear jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                    data: playerData
                });
            }
        }

        return result;
    }

    private validatePlayerData(data: PlayerImportData, row: number): ImportError[] {
        const errors: ImportError[] = [];

        // Validaciones obligatorias
        if (!data.name || data.name.trim() === '') {
            errors.push({
                row,
                field: 'name',
                message: 'El nombre es obligatorio'
            });
        }

        // Validación de email
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push({
                row,
                field: 'email',
                message: 'Formato de email inválido'
            });
        }

        // Validación de fecha de nacimiento
        if (data.birthDate && !this.isValidDate(data.birthDate)) {
            errors.push({
                row,
                field: 'birthDate',
                message: 'Formato de fecha inválido (usar YYYY-MM-DD)'
            });
        }

        // Validación de posición
        const validPositions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
        if (data.position && !validPositions.includes(data.position)) {
            errors.push({
                row,
                field: 'position',
                message: `Posición inválida. Válidas: ${validPositions.join(', ')}`
            });
        }

        // Validación de teléfono
        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push({
                row,
                field: 'phone',
                message: 'Formato de teléfono inválido'
            });
        }

        return errors;
    }

    private createPlayerFromData(data: PlayerImportData): Player {
        return new Player(
            uuidv4(),
            data.name,
            data.name.split(' ')[0], // firstName
            data.name.split(' ').slice(1).join(' '), // lastName
            data.nickname || data.name.split(' ')[0], // nickname por defecto
            data.email || undefined,
            data.phone || undefined,
            data.birthDate ? new Date(data.birthDate) : undefined,
            data.position || undefined,
            data.teamId || undefined,
            data.emergencyContact || undefined,
            data.medicalInfo || undefined,
            data.active !== undefined ? data.active : true
        );
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Método para generar plantilla CSV
    getCSVTemplate(): string {
        const headers = [
            'name',
            'nickname', 
            'email',
            'phone',
            'birthDate',
            'position',
            'teamId',
            'emergencyContact',
            'medicalInfo',
            'active'
        ];
        
        const example = [
            'María González',
            'Mari',
            'maria.gonzalez@hockey.com',
            '+1234567890',
            '1995-03-15',
            'Forward',
            '',
            'Pedro González - 555-0123',
            'Sin alergias',
            'true'
        ];

        return headers.join(',') + '\n' + example.join(',');
    }
}
