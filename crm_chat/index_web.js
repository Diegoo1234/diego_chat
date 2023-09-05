//const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const qrcode = require('qrcode'); 
const client = new Client();


client.on('qr', async qr => {
    try {
        // Genera el código QR como una imagen en formato base64
        const qrCodeDataURL = await generateQRBase64(qr);
 
        // Envía el código QR en formato base64 al cliente a través de Socket.IO
        io.emit('qrCode', qrCodeDataURL);
    } catch (error) {
        console.error('Error al generar el código QR:', error);
    }
});

// Función para generar el código QR como una imagen en formato base64
async function generateQRBase64(qrText) {
    return new Promise((resolve, reject) => {
        qrcode.toDataURL(qrText, (error, url) => {
            if (error) {
                reject(error);
            } else {
                resolve(url);
            }
        });
    });
}


client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    console.log(message.from);
    if (message.body === 'hola') {
        client.sendMessage(message.from, 'pong');
    }
});

client.initialize();

// Configura Express para servir archivos estáticos desde la carpeta "public"
app.use(express.static('src'));

// Ruta para servir la página HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

// Ruta para enviar un mensaje de WhatsApp como respuesta a una solicitud HTTP
app.get('/enviarMensaje', (req, res) => {
    // Define el número de destino y el mensaje que deseas enviar
    const numeroDestino = '51941744481@c.us'; // Reemplaza con el número de teléfono al que deseas enviar el mensaje
    const mensaje = 'Hola desde Express!';

    // Envía el mensaje
    client.sendMessage(numeroDestino, mensaje).then(() => {
        res.send('Mensaje de WhatsApp enviado con éxito.');
    }).catch(error => {
        console.error('Error al enviar el mensaje de WhatsApp:', error);
        res.status(500).send('Error al enviar el mensaje de WhatsApp.');
    });
});

// Inicia el servidor HTTP
http.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});