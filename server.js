const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.set('view engine', 'ejs');

// Cargar las imágenes en Base64 al iniciar el servidor para que estén siempre disponibles
const cargarImagenBase64 = (nombreArchivo) => {
    try {
        const ruta = path.join(__dirname, 'public', nombreArchivo);
        if (fs.existsSync(ruta)) {
            const bitmap = fs.readFileSync(ruta);
            const base64 = Buffer.from(bitmap).toString('base64');
            return `data:image/png;base64,${base64}`;
        }
    } catch (e) {
        console.log(`No se pudo cargar la imagen: ${nombreArchivo}`, e);
    }
    return '';
};

// Precargamos las imágenes (asegúrate de que los nombres coincidan con los de tu carpeta public)
const imagenesGlobales = {
    logoSuperior: cargarImagenBase64('logo-superior.png'),
    logoCentro: cargarImagenBase64('logo-centro.png'),
    firma: cargarImagenBase64('firma.png')
};

app.post('/generar-pdf', (req, res) => {
    const data = req.body || {};
    const plantilla = data.tipoPlantilla === '2' ? 'certificado2' : 'certificado1';

    // Cálculo automático de la fecha actual en español
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleString('es-ES', { month: 'long' });
    const anio = hoy.getFullYear();
    
    data.fechaTexto = `${dia} días del mes de ${mes} de ${anio}`;

    // Combinamos los datos que vienen de n8n con las imágenes en base64 del servidor
    const datosFinales = {
        ...data,
        ...imagenesGlobales
    };
    
    res.render(plantilla, datosFinales);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
