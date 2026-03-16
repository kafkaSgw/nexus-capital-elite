const fs = require('fs');
const mammoth = require('mammoth');
const path = require('path');

const docFilePath = 'c:\\Users\\Murilo Interpira\\Downloads\\NexusCapital (1)\\Vamos Lá isso é oq eu vou aprender.docx';
const outFilePath = 'c:\\Users\\Murilo Interpira\\Downloads\\NexusCapital (1)\\EstudosParsed.txt';

console.log('Extracting from', docFilePath);

mammoth.extractRawText({ path: docFilePath })
    .then(function (result) {
        const text = result.value;
        const messages = result.messages;
        fs.writeFileSync(outFilePath, text, 'utf8');
        console.log('Done! Extracted ' + text.length + ' chars.');
        if (messages.length > 0) {
            console.log('Messages:', messages);
        }
    })
    .catch(function (error) {
        console.error('Error extracting text:', error);
    });
