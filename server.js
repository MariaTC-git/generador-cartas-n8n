const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.set('view engine', 'ejs');

const cargarImagenBase64 = (nombreArchivo) => {
    try {
        const ruta = path.join(__dirname, 'public', nombreArchivo);
        console.log(`Buscando imagen en: ${ruta}`);
        if (fs.existsSync(ruta)) {
            const bitmap = fs.readFileSync(ruta);
            const base64 = Buffer.from(bitmap).toString('base64');
            console.log(`✅ Imagen cargada con éxito: ${nombreArchivo}`);
            return `data:image/png;base64,${base64}`;
        } else {
            console.log(`❌ NO se encontró el archivo en la ruta: ${ruta}`);
        }
    } catch (e) {
        console.log(`❌ Error al leer la imagen ${nombreArchivo}:`, e);
    }
    return '';
};

// Precargamos las imágenes
const imagenesGlobales = {
    logoSuperior: cargarImagenBase64('logo-superior.png'),
    logoCentro: cargarImagenBase64('logo-centro.png'),
    firma: cargarImagenBase64('firma.png')
};

app.post('/generar-pdf', (req, res) => {
    const data = req.body || {};
    const plantilla = data.tipoPlantilla === '2' ? 'certificado2' : 'certificado1';

    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleString('es-ES', { month: 'long' });
    const anio = hoy.getFullYear();
    
    data.fechaTexto = `${dia} días del mes de ${mes} de ${anio}`;

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
