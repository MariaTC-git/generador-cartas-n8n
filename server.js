const express = require('express');
const app = express();

app.use(express.json({ limit: '50mb' })); // Importante para recibir imágenes grandes en base64

app.post('/generar-pdf', (req, res) => {
    const data = req.body;
    
    // Puedes decidir qué plantilla usar según una variable que envíes desde n8n (ej: data.tipoPlantilla)
    const plantilla = data.tipoPlantilla === '2' ? 'certificado2' : 'certificado1';
    
    res.render(plantilla, data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
