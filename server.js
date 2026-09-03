const fs = require('fs');

// Función auxiliar para convertir imagen local a base64
function getBase64Image(filePath) {
    try {
        const bitmap = fs.readFileSync(filePath);
        return `data:image/png;base64,${bitmap.toString('base64')}`;
    } catch (e) {
        console.error(`Error leyendo imagen en ${filePath}:`, e);
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

        // INCRUSTAR IMÁGENES EN BASE64 DIRECTAMENTE DESDE LA CARPETA PUBLIC
        data.logoSuperior = getBase64Image(path.join(__dirname, 'public', 'logo-superior.png'));
        data.logoCentro = getBase64Image(path.join(__dirname, 'public', 'logo-centro.png'));
        data.firma = getBase64Image(path.join(__dirname, 'public', 'firma.png'));

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
                    printBackground: true,
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
