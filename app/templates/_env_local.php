<?php
/*
You *must* include the four main database defines

You may include other settings here that you only want enabled on your local development checkouts
*/

define( 'DB_NAME',     '<%= wpConfig['db']['name'] %>' );
define( 'DB_USER',     '<%= wpConfig['db']['user'] %>' );
define( 'DB_PASSWORD', '<%= wpConfig['db']['password'] %>' );
define( 'DB_HOST',     '<%= wpConfig['db']['host'] %>' );


// ==============================================================
// Salts, for security
// Grabbed from: https://api.wordpress.org/secret-key/1.1/salt
// ==============================================================
<%= wpConfig['security']['salts'] %>

// ==============================================================
// Table prefix
// Change this if you have multiple installs in the same database
// ==============================================================
$table_prefix  = '<%= wpConfig['tablePrefix'] %>';

// ================================
// Language
// Leave blank for American English
// ================================
define( 'WPLANG', '<%= wpConfig['language'] %>' );

// =================================================================
// Debug mode
// Debugging? Enable these.
// =================================================================
ini_set( 'display_errors', <%= wpConfig['debuggingEnabled'] ? 1 : 0 %> );
define( 'WP_DEBUG_DISPLAY', <%= wpConfig['debuggingEnabled'] ? true : false %> );
define( 'SAVEQUERIES', <%= wpConfig['debuggingEnabled'] ? true : false %> );
define( 'WP_DEBUG', <%= wpConfig['debuggingEnabled'] ? true : false %> );
