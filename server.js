const express = require('express');
const app = express();

app.use(express.json());

app.use(express.static('public'));

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');

app.post('/generar-pdf', (req, res) => {
    const data = req.body;
    
    // Puedes decidir qué plantilla usar según una variable que envíes desde n8n (ej: data.tipoPlantilla)
    const plantilla = data.tipoPlantilla === '2' ? 'certificado2' : 'certificado1';

    // Cálculo automático de la fecha actual en español
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleString('es-ES', { month: 'long' });
    const anio = hoy.getFullYear();
    
    data.fechaTexto = `${dia} días del mes de ${mes} de ${anio}`;
    
    res.render(plantilla, data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
