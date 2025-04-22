const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/whisper', upload.single('audio'), async (req, res) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(req.file.path));
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );

    fs.unlinkSync(req.file.path);
    res.json({ text: response.data.text });
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

app.get('/', (_, res) => res.send('Whisper Server OK'));
app.listen(3000, () => console.log('Servidor escuchando en puerto 3000'));
