import weaviate from 'weaviate-ts-client';
import "dotenv/config"; // Asegura que las variables del .env estén disponibles

// Usa https para instancias cloud y agrega autenticación si es necesario
const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST || 'localhost:8080',
  apiKey: process.env.WEAVIATE_API_KEY
    ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
    : undefined,
  headers: {
    'X-Openai-Api-Key': process.env.OPENAI_API_KEY || '', // <-- Asegura que la API Key esté aquí
  },
});

const texts = [
  "La inteligencia artificial es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, como el reconocimiento de voz, la toma de decisiones o el procesamiento del lenguaje natural.",
  "El cambio climático se refiere a alteraciones significativas y duraderas en los patrones del clima global. Es causado principalmente por la emisión de gases de efecto invernadero debido a la actividad humana, como la quema de combustibles fósiles y la deforestación.",
  "Las bases de datos vectorizadas permiten realizar búsquedas semánticas a partir de representaciones numéricas del contenido, llamadas embeddings, que capturan el significado contextual de los datos.",
  "Weaviate es una base de datos vectorial de código abierto que permite almacenar objetos con vectores, realizar búsquedas semánticas y aplicar módulos como generative-openai para generar respuestas a partir del contenido almacenado.",
  "El modelo GPT-4 de OpenAI es capaz de generar texto coherente y realizar tareas complejas como traducción, programación, resumen de documentos y simulación de diálogos en múltiples idiomas, gracias a su entrenamiento masivo en grandes cantidades de datos."
];


async function insertTexts() {
  for (const text of texts) {
    try {
      const res = await client.data
        .creator()
        .withClassName('Content')
        .withProperties({ text })
        .do();
      console.log('✅ Insertado:', text);
    } catch (err) {
      console.error('❌ Error insertando texto:', err);
    }
  }
}

insertTexts();
