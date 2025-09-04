import { Router } from 'express';
import multer from 'multer';
import { PlayerImportController } from '../controllers/PlayerImportController.js';
import { PlayerImportService } from '../../application/services/PlayerImportService.js';
import { FileParserFactory } from '../../application/parsers/FileParser.js';
import { PlayerRepositoryPostgres } from '../../core/repositories/PlayerRepositoryPostgres.js';

// Configuración de multer para manejo de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.csv', '.json'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        
        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de archivo no permitido: ${fileExtension}. Permitidos: ${allowedExtensions.join(', ')}`));
        }
    }
});

export function createPlayerImportRoutes(): Router {
    const router = Router();
    
    // Crear dependencias
    const playerRepository = new PlayerRepositoryPostgres();
    const importService = new PlayerImportService(playerRepository);
    const parserFactory = new FileParserFactory();
    const importController = new PlayerImportController(importService, parserFactory);

    // Rutas
    
    // GET /api/players/import/formats - Obtener formatos soportados
    router.get('/formats', (req, res) => {
        importController.getSupportedFormats(req, res);
    });

    // GET /api/players/import/template - Descargar plantilla
    router.get('/template', (req, res) => {
        importController.downloadTemplate(req, res);
    });

    // POST /api/players/import/:teamId - Subir archivo para importar a un equipo específico
    router.post('/:teamId', upload.single('file'), (req, res) => {
        importController.uploadFile(req, res);
    });

    // Manejo de errores de multer
    router.use((error: any, req: any, res: any, next: any) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'Archivo demasiado grande',
                    message: 'El archivo no puede exceder los 5MB'
                });
            }
        }
        
        if (error.message) {
            return res.status(400).json({
                error: 'Error de archivo',
                message: error.message
            });
        }

        next(error);
    });

    return router;
}
