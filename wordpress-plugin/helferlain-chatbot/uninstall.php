<?php
/**
 * HelferLain Chatbot Plugin Uninstall
 * 
 * Diese Datei wird ausgeführt wenn das Plugin gelöscht wird.
 * Alle Plugin-Daten werden sicher entfernt.
 */

// Sicherheitscheck - nur ausführen wenn WordPress das Plugin wirklich deinstalliert
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Plugin-Optionen löschen
delete_option('helferlain_chatbot_settings');

// Transients löschen
delete_transient('helferlain_chatbot_cache');
delete_transient('helferlain_chatbot_analytics');

// User Meta löschen (falls vorhanden)
$users = get_users();
foreach ($users as $user) {
    delete_user_meta($user->ID, 'helferlain_chatbot_preferences');
}

// Logs löschen (falls vorhanden)
global $wpdb;

// Custom Tables löschen (falls welche erstellt wurden)
$table_name = $wpdb->prefix . 'helferlain_chat_logs';
$wpdb->query("DROP TABLE IF EXISTS {$table_name}");

// Scheduled Hooks löschen
wp_clear_scheduled_hook('helferlain_chatbot_cleanup');
wp_clear_scheduled_hook('helferlain_chatbot_analytics_sync');

// Upload-Verzeichnis bereinigen (falls vorhanden)
$upload_dir = wp_upload_dir();
$plugin_dir = $upload_dir['basedir'] . '/helferlain-chatbot/';
if (is_dir($plugin_dir)) {
    // Rekursiv alle Dateien löschen
    function helferlain_remove_directory($dir) {
        if (is_dir($dir)) {
            $files = array_diff(scandir($dir), array('.', '..'));
            foreach ($files as $file) {
                $path = $dir . '/' . $file;
                if (is_dir($path)) {
                    helferlain_remove_directory($path);
                } else {
                    unlink($path);
                }
            }
            rmdir($dir);
        }
    }
    helferlain_remove_directory($plugin_dir);
}

// Cache leeren
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

// Log für Debugging (optional)
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('HelferLain Chatbot Plugin: Deinstallation abgeschlossen');
}
?>