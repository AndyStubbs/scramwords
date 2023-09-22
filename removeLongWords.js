'use strict';

const fs = require('fs');
const MAX_LENGTH = 7;

fs.readFile('dictionary.json', (err, data) => {
    if (err) throw err;
    let allWords = JSON.parse(data);
    let finalWords = {};
    let beforeWordCount = 0;
    let afterWordCount = 0;
    for(let word in allWords) {
        word = word.toLowerCase();
        beforeWordCount += 1;
        if(
            word.length <= MAX_LENGTH && 
            word.length > 1 && 
            word.indexOf("-") === -1 &&
            word.indexOf(" ") === -1
        ) {
            finalWords[ word ] = 1;
            afterWordCount += 1;
        }
    }
    finalWords[ "hi" ] = 1;
    fs.writeFile("gram_words.json", JSON.stringify(finalWords), null, function () {
        console.log( "Converted " + afterWordCount + " out of " + beforeWordCount + " to file." );
    });
    fs.writeFile("web\\gram_words.js", "var words = " + JSON.stringify(finalWords) + ";", null, function ( err ) {
        console.log( err );
        console.log( "Converted " + afterWordCount + " out of " + beforeWordCount + " to file." );
    });
});