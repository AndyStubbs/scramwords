<?php

switch( $_GET[ 'op' ] ) {
    case 'get-game':
        $data = new stdClass();
        $file1 = '';

        $datestr = getFileDateStr();
        $file1 = getFileName( 'server/games/letters', $datestr, '.txt' );
        $file2 = getFileName( 'server/games/results', $datestr, '.json' );
        if( ! file_exists( $file1 ) || ! file_exists( $file2 ) ) {
            createNewGame( $file1, $file2 );
        }

        $data->letters = file_get_contents( $file1 );
        $data->results = json_decode( file_get_contents( $file2 ) );
        $data->datestr = $datestr;

        echo json_encode( $data );
        exit();
        break;
}

function getFileDateStr() {
    $curtime = time();
    if( isset( $_GET[ 'rand_date' ] ) ) {
        $firsttime = ( int )file_get_contents( 'server/data/firsttime.txt' );
        $curtime = rand( $firsttime, $curtime - 86400 );
    } elseif( isset( $_GET[ 'get-date' ] ) ) {
        $curtime = $_GET[ 'get-date' ];
    }
    return getDateStr( $curtime );
}

function getFileName( $prefix, $datestr, $extension ) {
    return $prefix . '_' . $datestr . $extension;
}

function getDateStr( $time ) {
	$today = getdate( $time );
	return $today[ 'year' ] . '_' . padDigit( $today[ 'mon' ] ) . '_' . padDigit( $today[ 'mday' ] );
}

function padDigit( $num ) {
	$format = '%02d';
    return sprintf( $format, $num );
}

function createNewGame( $file1, $file2 ) {
    $dictionary = json_decode( file_get_contents( 'server/data/short_dictionary.json' ), true );
    $longWords = json_decode( file_get_contents( 'server/data/long_words.json' ), true );

    $cnt = 0;
    $str = '';

    while( $cnt < 25 ) {
        $str = $longWords[ array_rand( $longWords, 1 ) ];
        $parts = str_split( $str );
        sort( $parts );
        $str = implode( $parts );

        // Get all combinations of word
        $combos = getAllWordCombos( $str );
        $finalWords = array();
        foreach( $combos as $word ) {
            if( array_key_exists( $word, $dictionary ) ) {
                $finalWords[ $word ] = $dictionary[ $word ];
            }
        }

        $cnt = count( $finalWords );
    }

    file_put_contents( $file1, $str );
    file_put_contents( $file2, json_encode( $finalWords ) );
}

function getAllWordCombos( $str ) {
    $dict = array();
    innerGetAllWordCombos( $str, $dict );
    $allWords = array();
    foreach( $dict as $key => $word ) {
        array_push( $allWords, $key );
    }
    sort( $allWords );

    return $allWords;
}

function innerGetAllWordCombos( $str, &$dict ) {
    if( strlen( $str ) < 2 ) {
        return str_split( $str );
    }
    $arr = array();
    for( $i = 0; $i < strlen( $str ); $i++ ) {
        $chr = $str[ $i ];
        //echo $chr . '<br />';
        $dict[ $chr ] = 1;
        if( strpos( $str, $chr ) !== $i ) {
            continue;
        }
        $post = substr( $str, 0, $i ) . substr( $str, $i + 1 );
        $arr2 = innerGetAllWordCombos( $post, $dict );
        $cnt = count( $arr2 );
        for( $j = 0; $j < $cnt; $j += 1 ) {
            $temp = $chr . $arr2[ $j ];
            //echo $temp . '<br />';
            $dict[ $temp ] = 1;
            if( $temp !== '' ) {
                array_push( $arr, $temp );
            }
        }
    }
    return $arr;
}
