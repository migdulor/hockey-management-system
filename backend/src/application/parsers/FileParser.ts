import { PlayerImportData } from '../services/PlayerImportService.js';

export interface FileParser {
    parse(buffer: Buffer, filename: string): Promise<PlayerImportData[]>;
    getSupportedExtensions(): string[];
}

export class CSVParser implements FileParser {
    getSupportedExtensions(): string[] {
        return ['.csv'];
    }

    async parse(buffer: Buffer, filename: string): Promise<PlayerImportData[]> {
        const content = buffer.toString('utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            throw new Error('El archivo está vacío');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const players: PlayerImportData[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const player: Partial<PlayerImportData> = {};

            headers.forEach((header, index) => {
                const value = values[index]?.trim();
                if (value && value !== '') {
                    switch (header.toLowerCase()) {
                        case 'name':
                        case 'nombre':
                            player.name = value;
                            break;
                        case 'nickname':
                        case 'apodo':
                            player.nickname = value;
                            break;
                        case 'email':
                        case 'correo':
                            player.email = value;
                            break;
                        case 'phone':
                        case 'telefono':
                        case 'teléfono':
                            player.phone = value;
                            break;
                        case 'birthdate':
                        case 'birth_date':
                        case 'fecha_nacimiento':
                        case 'fechanacimiento':
                            player.birthDate = value;
                            break;
                        case 'position':
                        case 'posicion':
                        case 'posición':
                            player.position = this.translatePosition(value);
                            break;
                        case 'teamid':
                        case 'team_id':
                        case 'equipo_id':
                        case 'equipoid':
                            player.teamId = value;
                            break;
                        case 'emergencycontact':
                        case 'emergency_contact':
                        case 'contacto_emergencia':
                        case 'contactoemergencia':
                            player.emergencyContact = value;
                            break;
                        case 'medicalinfo':
                        case 'medical_info':
                        case 'info_medica':
                        case 'infomedica':
                            player.medicalInfo = value;
                            break;
                        case 'active':
                        case 'activo':
                            player.active = this.parseBoolean(value);
                            break;
                    }
                }
            });

            if (player.name) {
                players.push(player as PlayerImportData);
            }
        }

        return players;
    }

    private parseCSVLine(line: string): string[] {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        values.push(currentValue);
        return values;
    }

    private translatePosition(position: string): string {
        const translations: { [key: string]: string } = {
            'delantero': 'Forward',
            'delanteira': 'Forward',
            'atacante': 'Forward',
            'mediocampo': 'Midfielder',
            'medio': 'Midfielder',
            'centrocampista': 'Midfielder',
            'defensa': 'Defender',
            'defensora': 'Defender',
            'defensor': 'Defender',
            'portero': 'Goalkeeper',
            'portera': 'Goalkeeper',
            'arquero': 'Goalkeeper',
            'arquera': 'Goalkeeper',
            'guardameta': 'Goalkeeper'
        };

        const lowerPosition = position.toLowerCase();
        return translations[lowerPosition] || position;
    }

    private parseBoolean(value: string): boolean {
        const lowerValue = value.toLowerCase().trim();
        return ['true', '1', 'si', 'sí', 'yes', 'y', 'activo', 'active'].includes(lowerValue);
    }
}

export class JSONParser implements FileParser {
    getSupportedExtensions(): string[] {
        return ['.json'];
    }

    async parse(buffer: Buffer, filename: string): Promise<PlayerImportData[]> {
        try {
            const content = buffer.toString('utf-8');
            const data = JSON.parse(content);

            if (!Array.isArray(data)) {
                throw new Error('El archivo JSON debe contener un array de jugadores');
            }

            return data.map((item, index) => {
                if (typeof item !== 'object' || item === null) {
                    throw new Error(`Elemento ${index + 1} no es un objeto válido`);
                }
                return item as PlayerImportData;
            });
        } catch (error) {
            throw new Error(`Error parseando JSON: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}

export class FileParserFactory {
    private parsers: FileParser[] = [
        new CSVParser(),
        new JSONParser()
    ];

    getParser(filename: string): FileParser {
        const extension = this.getFileExtension(filename);
        
        for (const parser of this.parsers) {
            if (parser.getSupportedExtensions().includes(extension)) {
                return parser;
            }
        }

        throw new Error(`Tipo de archivo no soportado: ${extension}. Formatos soportados: ${this.getSupportedExtensions().join(', ')}`);
    }

    getSupportedExtensions(): string[] {
        return this.parsers.flatMap(parser => parser.getSupportedExtensions());
    }

    private getFileExtension(filename: string): string {
        const lastDot = filename.lastIndexOf('.');
        return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
    }
}
