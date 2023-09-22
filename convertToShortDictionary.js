'use strict';

const fs = require('fs');
const MAX_LENGTH = 6;

fs.readFile('dictionary.json', (err, data) => {
    if (err) throw err;
    let allWords = JSON.parse(data);
    let finalWords = {};
    let justWords = [];
    let beforeWordCount = 0;
    let afterWordCount = 0;
    let shortDefs = {};
    let bigWords = [];

    // Added words
    allWords[ "hi" ] = "Hello.";

    for( let word in allWords ) {
        beforeWordCount += 1;
        if(
            word.length <= MAX_LENGTH &&
            word.length > 1 &&
            word.indexOf("-") === -1 &&
            word.indexOf(" ") === -1
        ) {
            justWords.push( word );
        }
    }
    justWords.sort();
    for( let i = 0; i < justWords.length; i++ ) {
        let word = justWords[ i ];
        finalWords[ word.toLowerCase() ] = allWords[ word ].length < 150 ? allWords[ word ] : allWords[ word ].substring( 0, 147 ) + "...";
        afterWordCount += 1;
        if( allWords[ word ].length < 25 ) {
            shortDefs[ word ] = allWords[ word ];
        }
        if( word.length === MAX_LENGTH ) {
            bigWords.push( word.toLowerCase() );
        }
    }
    
    fs.writeFile("short_dictionary.json", JSON.stringify( finalWords ), null, function ( err ) {
        if( err ) {
            console.log( err );
        }
        console.log( "Converted " + afterWordCount + " out of " + beforeWordCount + " to file." );
    });
    fs.writeFile("web\\long_words.json", JSON.stringify( bigWords ), null, function ( err ) {
        if( err ) {
            console.log( err );
        }
    });
    fs.writeFile("web\\short_dictionary.json", JSON.stringify( finalWords ), null, function ( err ) {
        if( err ) {
            console.log( err );
        }
    });
    fs.writeFile("web\\short_dictionary.js", "var dictionary = " + JSON.stringify( finalWords ) + ";", null, function ( err ) {
        if( err ) {
            console.log( err );
        }
    });
    fs.writeFile("short_defs_dictionary.json", JSON.stringify( shortDefs ), null, function ( err ) {
        if( err ) {
            console.log( err );
        }
    });
});