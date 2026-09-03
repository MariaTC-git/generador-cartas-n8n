const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Función auxiliar para convertir una imagen local a Base64
function obtenerImagenBase64(nombreArchivo) {
    try {
        const rutaArchivo = path.join(__dirname, 'public', nombreArchivo);
        const bitmap = fs.readFileSync(rutaArchivo);
        const extension = path.extname(nombreArchivo).substring(1);
        return `data:image/${extension};base64,${bitmap.toString('base64')}`;
    } catch (e) {
        console.error(`No se pudo cargar la imagen ${nombreArchivo}:`, e.message);
        return '';
    }
}

app.post('/generar-pdf', async (req, res) => {
    try {
        const data = req.body;
        const plantilla = data.tipoPlantilla === '2' ? 'certificado2' : 'certificado1';

        // Fecha en español
        const hoy = new Date();
        const dia = hoy.getDate();
        const mes = hoy.toLocaleString('es-ES', { month: 'long' });
        const anio = hoy.getFullYear();
        data.fechaTexto = `${dia} días del mes de ${mes} de ${anio}`;

        // Inyectar imágenes en Base64 para que Puppeteer las renderice sin problemas de red
        data.logoSuperior = obtenerImagenBase64('logo-superior.png');
        data.logoCentro = obtenerImagenBase64('logo-centro.png');
        data.firma = obtenerImagenBase64('firma.png');

        // 1. Renderizar la vista EJS a HTML en memoria
        app.render(plantilla, data, async (err, html) => {
            if (err) {
                console.error('Error al renderizar EJS:', err);
                return res.status(500).json({ error: 'Error al renderizar la plantilla' });
            }

            try {
                // 2. Lanzar Puppeteer
                const browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                
                const page = await browser.newPage();

                // 3. Cargar el HTML generado
                await page.setContent(html, { waitUntil: 'networkidle0' });

                // 4. Generar el PDF
                const pdfBuffer = await page.pdf({
                    format: 'Letter',
                    printBackground: true, // Vital para fondos y colores
                    margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' }
                });

                await browser.close();

                // 5. Enviar el PDF como respuesta binaria a n8n
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="certificado.pdf"');
                return res.send(pdfBuffer);

            } catch (puppeteerError) {
                console.error('Error en Puppeteer:', puppeteerError);
                return res.status(500).json({ error: 'Error generando el PDF con Puppeteer' });
            }
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
