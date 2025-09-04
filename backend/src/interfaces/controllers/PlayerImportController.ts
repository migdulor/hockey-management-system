import { Request, Response } from 'express';
import { PlayerImportService } from '../../application/services/PlayerImportService.js';
import { FileParserFactory } from '../../application/parsers/FileParser.js';

export class PlayerImportController {
    constructor(
        private importService: PlayerImportService,
        private parserFactory: FileParserFactory
    ) {}

    async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    error: 'No se ha subido ningún archivo'
                });
                return;
            }

            const { originalname, buffer } = req.file;
            
            console.log(`Procesando archivo: ${originalname}, tamaño: ${buffer.length} bytes`);

            // Verificar extensión soportada
            const supportedExtensions = this.parserFactory.getSupportedExtensions();
            const fileExtension = this.getFileExtension(originalname);
            
            if (!supportedExtensions.includes(fileExtension)) {
                res.status(400).json({
                    error: `Tipo de archivo no soportado: ${fileExtension}`,
                    supportedFormats: supportedExtensions
                });
                return;
            }

            // Parsear archivo
            const parser = this.parserFactory.getParser(originalname);
            const playersData = await parser.parse(buffer, originalname);

            if (playersData.length === 0) {
                res.status(400).json({
                    error: 'No se encontraron jugadores válidos en el archivo'
                });
                return;
            }

            // Importar jugadores
            const { teamId } = req.params;
            const result = await this.importService.importPlayers(playersData, teamId);

            console.log(`Resultado de importación: ${result.success} exitosos, ${result.errors.length} errores`);

            res.status(200).json({
                message: 'Importación completada',
                result: {
                    total: result.total,
                    success: result.success,
                    errors: result.errors.length,
                    errorDetails: result.errors
                }
            });

        } catch (error) {
            console.error('Error en uploadFile:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    async downloadTemplate(req: Request, res: Response): Promise<void> {
        try {
            const format = req.query.format as string || 'csv';

            if (format.toLowerCase() === 'csv') {
                const csvTemplate = this.importService.getCSVTemplate();
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=plantilla_jugadores.csv');
                res.send(csvTemplate);
            } else if (format.toLowerCase() === 'json') {
                const jsonTemplate = [
                    {
                        name: "María González",
                        nickname: "Mari",
                        email: "maria.gonzalez@hockey.com",
                        phone: "+1234567890",
                        birthDate: "1995-03-15",
                        position: "Forward",
                        teamId: "",
                        emergencyContact: "Pedro González - 555-0123",
                        medicalInfo: "Sin alergias",
                        active: true
                    }
                ];

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=plantilla_jugadores.json');
                res.json(jsonTemplate);
            } else {
                res.status(400).json({
                    error: 'Formato no soportado',
                    supportedFormats: ['csv', 'json']
                });
            }
        } catch (error) {
            console.error('Error en downloadTemplate:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    async getSupportedFormats(req: Request, res: Response): Promise<void> {
        try {
            const supportedExtensions = this.parserFactory.getSupportedExtensions();
            
            res.json({
                supportedFormats: supportedExtensions,
                examples: {
                    csv: 'Archivo separado por comas (.csv)',
                    json: 'Archivo JSON (.json)'
                },
                templateEndpoint: '/api/players/import/template?format={csv|json}'
            });
        } catch (error) {
            console.error('Error en getSupportedFormats:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    private getFileExtension(filename: string): string {
        const lastDot = filename.lastIndexOf('.');
        return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
    }
}
