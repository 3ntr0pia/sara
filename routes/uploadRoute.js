const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Ruta del archivo subido
    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

    // Leer el archivo
    fs.readFile(filePath, 'utf8', (err, data) => {
		// ... (manejo de errores)
	
		// Procesar el contenido del archivo
		const questionData = processFileContent(data);
	
		// Mostrar preguntas y respuestas en la consola
		questionData.forEach((item, index) => {
			console.log(`Pregunta ${index + 1}: ${item.question}`);
			item.answers.forEach((answer, answerIndex) => {
				console.log(`  Respuesta ${String.fromCharCode(65 + answerIndex)}: ${answer}`);
			});
			console.log(""); // Añade un espacio entre preguntas
		});
	
		res.send('Archivo procesado con éxito');
	});
	
};

function processFileContent(content) {
    // Dividir el contenido por doble salto de línea para obtener cada bloque de pregunta
    const questionBlocks = content.split('\n\n');

    return questionBlocks.map(block => {
        // Separar cada línea del bloque (pregunta y respuestas)
        const lines = block.split('\n');

        // La primera línea es la pregunta
        const question = lines[0].split(': ')[1].trim();

        // Las siguientes líneas son respuestas
        const answers = lines.slice(1).map(line => {
            const isCorrect = line.includes('(Correcta)');
            const answer = line.replace(' (Correcta)', '').trim();

            // Resaltar la respuesta correcta en la consola
            const answerDisplay = isCorrect ? `*${answer}* (Correcta)` : answer;
            return answerDisplay;
        });

        // Formatear la pregunta y respuestas para la consola
        return {
            question,
            answers
        };
    });
}
