<?php
/*
You *must* include the four main database defines

You may include other settings here that you only want enabled on your local development checkouts
*/

define( 'DB_NAME',     '<%= answers['local.db.name'] %>' );
define( 'DB_USER',     '<%= answers['local.db.user'] %>' );
define( 'DB_PASSWORD', '<%= answers['local.db.password'] %>' );
define( 'DB_HOST',     '<%= answers['local.db.host'] %>' );


// ==============================================================
// Salts, for security
// Grabbed from: https://api.wordpress.org/secret-key/1.1/salt
// ==============================================================
<%= answers['salts'] %>

// ==============================================================
// Table prefix
// Change this if you have multiple installs in the same database
// ==============================================================
$table_prefix  = '<%= answers['local.db.prefix'] %>';

// ================================
// Language
// Leave blank for American English
// ================================
define( 'WPLANG', '<%= answers['lang'] %>' );

// =================================================================
// Debug mode
// Debugging? Enable these.
// =================================================================
ini_set( 'display_errors', <%= answers['debugging'] ? 1 : 0 %> );
define( 'WP_DEBUG_DISPLAY', <%= answers['debugging'] ? true : false %> );
define( 'SAVEQUERIES', <%= answers['debugging'] ? true : false %> );
define( 'WP_DEBUG', <%= answers['debugging'] ? true : false %> );
