<?php
/**
 * Plugin Name: HelferLain Chatbot
 * Plugin URI: https://helferlain.app
 * Description: Integriere deinen HelferLain Chatbot nahtlos in deine WordPress Website. Einfache Installation mit Shortcode-Unterstützung.
 * Version: 1.0.0
 * Author: HelferLain
 * Author URI: https://helferlain.app
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: helferlain-chatbot
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

// Sicherheitscheck - Plugin nur in WordPress-Kontext ausführen
if (!defined('ABSPATH')) {
    exit;
}

// Plugin-Konstanten definieren
define('HELFERLAIN_CHATBOT_VERSION', '1.0.0');
define('HELFERLAIN_CHATBOT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('HELFERLAIN_CHATBOT_PLUGIN_PATH', plugin_dir_path(__FILE__));

class HelferLainChatbot {
    
    private $options;
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'settings_init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('helferlain_chatbot', array($this, 'shortcode_handler'));
        add_action('wp_footer', array($this, 'add_chatbot_to_footer'));
        
        // AJAX Handlers für Preview
        add_action('wp_ajax_helferlain_preview', array($this, 'ajax_preview'));
        add_action('wp_ajax_nopriv_helferlain_preview', array($this, 'ajax_preview'));
        
        // Plugin Aktivierung/Deaktivierung
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Plugin-Textdomain laden
        load_plugin_textdomain('helferlain-chatbot', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Optionen laden
        $this->options = get_option('helferlain_chatbot_settings', array());
    }
    
    public function activate() {
        // Standard-Einstellungen bei Aktivierung
        $default_settings = array(
            'bot_id' => '',
            'api_endpoint' => 'https://api.helferlain.app',
            'position' => 'bottom-right',
            'theme' => 'light',
            'auto_open' => false,
            'welcome_message' => 'Hallo! Wie kann ich Ihnen helfen?',
            'enable_on_all_pages' => true,
            'exclude_pages' => array(),
            'custom_css' => '',
            'analytics_enabled' => true
        );
        
        if (!get_option('helferlain_chatbot_settings')) {
            add_option('helferlain_chatbot_settings', $default_settings);
        }
    }
    
    public function deactivate() {
        // Cleanup bei Deaktivierung (optional)
    }
    
    public function enqueue_scripts() {
        if (!$this->should_load_chatbot()) {
            return;
        }
        
        // HelferLain Widget Script laden
        wp_enqueue_script(
            'helferlain-widget',
            $this->get_api_endpoint() . '/widget.js',
            array(),
            HELFERLAIN_CHATBOT_VERSION,
            true
        );
        
        // Plugin-spezifisches CSS
        wp_enqueue_style(
            'helferlain-chatbot-style',
            HELFERLAIN_CHATBOT_PLUGIN_URL . 'assets/style.css',
            array(),
            HELFERLAIN_CHATBOT_VERSION
        );
        
        // Custom CSS falls vorhanden
        if (!empty($this->options['custom_css'])) {
            wp_add_inline_style('helferlain-chatbot-style', $this->options['custom_css']);
        }
    }
    
    public function shortcode_handler($atts, $content = null) {
        // Shortcode-Attribute mit Defaults
        $attributes = shortcode_atts(array(
            'bot_id' => $this->get_bot_id(),
            'position' => $this->get_option('position', 'bottom-right'),
            'theme' => $this->get_option('theme', 'light'),
            'auto_open' => $this->get_option('auto_open', false),
            'welcome_message' => $this->get_option('welcome_message', ''),
            'width' => '400',
            'height' => '600',
            'inline' => false
        ), $atts);
        
        if (empty($attributes['bot_id'])) {
            return '<div class="helferlain-error">Fehler: Bot ID nicht konfiguriert. Bitte gehen Sie zu den Plugin-Einstellungen.</div>';
        }
        
        $unique_id = 'helferlain-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($unique_id); ?>" class="helferlain-chatbot-container">
            <?php if ($attributes['inline']): ?>
                <div class="helferlain-inline-chat" style="width: <?php echo esc_attr($attributes['width']); ?>px; height: <?php echo esc_attr($attributes['height']); ?>px;"></div>
            <?php endif; ?>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof HelferLain !== 'undefined') {
                HelferLain.init({
                    botId: '<?php echo esc_js($attributes['bot_id']); ?>',
                    apiEndpoint: '<?php echo esc_js($this->get_api_endpoint()); ?>',
                    container: '<?php echo esc_js($unique_id); ?>',
                    position: '<?php echo esc_js($attributes['position']); ?>',
                    theme: '<?php echo esc_js($attributes['theme']); ?>',
                    autoOpen: <?php echo $attributes['auto_open'] ? 'true' : 'false'; ?>,
                    welcomeMessage: '<?php echo esc_js($attributes['welcome_message']); ?>',
                    inline: <?php echo $attributes['inline'] ? 'true' : 'false'; ?>,
                    analytics: <?php echo $this->get_option('analytics_enabled', true) ? 'true' : 'false'; ?>
                });
            } else {
                console.error('HelferLain Widget konnte nicht geladen werden.');
            }
        });
        </script>
        <?php
        return ob_get_clean();
    }
    
    public function add_chatbot_to_footer() {
        if (!$this->should_load_chatbot() || !$this->get_option('enable_on_all_pages', true)) {
            return;
        }
        
        echo $this->shortcode_handler(array());
    }
    
    public function add_admin_menu() {
        add_options_page(
            'HelferLain Chatbot Einstellungen',
            'HelferLain Chatbot',
            'manage_options',
            'helferlain-chatbot',
            array($this, 'admin_page')
        );
    }
    
    public function settings_init() {
        register_setting('helferlain_chatbot', 'helferlain_chatbot_settings');
        
        // Haupt-Sektion
        add_settings_section(
            'helferlain_chatbot_main',
            'Grundeinstellungen',
            array($this, 'settings_section_callback'),
            'helferlain_chatbot'
        );
        
        // Bot ID Feld
        add_settings_field(
            'bot_id',
            'Bot ID',
            array($this, 'bot_id_field_callback'),
            'helferlain_chatbot',
            'helferlain_chatbot_main'
        );
        
        // API Endpoint Feld
        add_settings_field(
            'api_endpoint',
            'API Endpoint',
            array($this, 'api_endpoint_field_callback'),
            'helferlain_chatbot',
            'helferlain_chatbot_main'
        );
        
        // Weitere Felder...
        $fields = array(
            'position' => 'Position des Chatbots',
            'theme' => 'Design Theme',
            'auto_open' => 'Automatisch öffnen',
            'welcome_message' => 'Begrüßungsnachricht',
            'enable_on_all_pages' => 'Auf allen Seiten anzeigen',
            'analytics_enabled' => 'Analytics aktivieren'
        );
        
        foreach ($fields as $field_id => $field_title) {
            add_settings_field(
                $field_id,
                $field_title,
                array($this, $field_id . '_field_callback'),
                'helferlain_chatbot',
                'helferlain_chatbot_main'
            );
        }
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>HelferLain Chatbot Einstellungen</h1>
            
            <div class="helferlain-admin-header">
                <img src="<?php echo HELFERLAIN_CHATBOT_PLUGIN_URL; ?>assets/logo.png" alt="HelferLain" style="height: 40px; vertical-align: middle;">
                <span style="margin-left: 10px; font-size: 18px; color: #4f46e5;">HelferLain Chatbot Integration</span>
            </div>
            
            <div class="helferlain-admin-content">
                <div class="helferlain-settings-panel">
                    <form action="options.php" method="post">
                        <?php
                        settings_fields('helferlain_chatbot');
                        do_settings_sections('helferlain_chatbot');
                        submit_button('Einstellungen speichern');
                        ?>
                    </form>
                </div>
                
                <div class="helferlain-preview-panel">
                    <h2>Live-Vorschau</h2>
                    <div id="helferlain-preview-container">
                        <button type="button" id="helferlain-preview-btn" class="button">Chatbot-Vorschau anzeigen</button>
                        <div id="helferlain-preview-area" style="display: none; border: 1px solid #ccc; padding: 20px; margin-top: 10px; height: 400px; position: relative;"></div>
                    </div>
                </div>
            </div>
            
            <div class="helferlain-usage-info">
                <h2>Verwendung</h2>
                <h3>Shortcode:</h3>
                <code>[helferlain_chatbot]</code>
                
                <h3>Mit benutzerdefinierten Attributen:</h3>
                <code>[helferlain_chatbot bot_id="ihre-bot-id" position="bottom-left" theme="dark" auto_open="true"]</code>
                
                <h3>Inline-Chat:</h3>
                <code>[helferlain_chatbot inline="true" width="500" height="700"]</code>
            </div>
        </div>
        
        <style>
        .helferlain-admin-header {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4f46e5;
        }
        .helferlain-admin-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        .helferlain-settings-panel, .helferlain-preview-panel {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .helferlain-usage-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .helferlain-usage-info code {
            background: #e5e7eb;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
        }
        </style>
        
        <script>
        document.getElementById('helferlain-preview-btn').addEventListener('click', function() {
            var previewArea = document.getElementById('helferlain-preview-area');
            var btn = this;
            
            if (previewArea.style.display === 'none') {
                previewArea.style.display = 'block';
                btn.textContent = 'Vorschau ausblenden';
                
                // Load preview
                var botId = document.querySelector('input[name="helferlain_chatbot_settings[bot_id]"]').value;
                if (botId) {
                    previewArea.innerHTML = '<div id="helferlain-preview-chat"></div>';
                    // Initialize preview chatbot here
                } else {
                    previewArea.innerHTML = '<p style="color: #dc2626;">Bitte geben Sie zuerst eine Bot ID ein.</p>';
                }
            } else {
                previewArea.style.display = 'none';
                btn.textContent = 'Chatbot-Vorschau anzeigen';
            }
        });
        </script>
        <?php
    }
    
    // Settings Field Callbacks
    public function settings_section_callback() {
        echo '<p>Konfigurieren Sie Ihren HelferLain Chatbot für die WordPress-Integration.</p>';
    }
    
    public function bot_id_field_callback() {
        $value = $this->get_option('bot_id', '');
        echo '<input type="text" name="helferlain_chatbot_settings[bot_id]" value="' . esc_attr($value) . '" class="regular-text" placeholder="Ihre Bot ID von HelferLain" required />';
        echo '<p class="description">Die Bot ID finden Sie in Ihrem HelferLain Dashboard nach der Erstellung eines Chatbots.</p>';
    }
    
    public function api_endpoint_field_callback() {
        $value = $this->get_option('api_endpoint', 'https://api.helferlain.app');
        echo '<input type="url" name="helferlain_chatbot_settings[api_endpoint]" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Standard: https://api.helferlain.app (nur ändern wenn Sie einen eigenen Server verwenden)</p>';
    }
    
    public function position_field_callback() {
        $value = $this->get_option('position', 'bottom-right');
        $options = array(
            'bottom-right' => 'Unten rechts',
            'bottom-left' => 'Unten links',
            'top-right' => 'Oben rechts',
            'top-left' => 'Oben links'
        );
        
        echo '<select name="helferlain_chatbot_settings[position]">';
        foreach ($options as $key => $label) {
            echo '<option value="' . esc_attr($key) . '"' . selected($value, $key, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
    }
    
    public function theme_field_callback() {
        $value = $this->get_option('theme', 'light');
        $options = array(
            'light' => 'Hell',
            'dark' => 'Dunkel',
            'auto' => 'Automatisch'
        );
        
        echo '<select name="helferlain_chatbot_settings[theme]">';
        foreach ($options as $key => $label) {
            echo '<option value="' . esc_attr($key) . '"' . selected($value, $key, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
    }
    
    public function auto_open_field_callback() {
        $value = $this->get_option('auto_open', false);
        echo '<input type="checkbox" name="helferlain_chatbot_settings[auto_open]" value="1"' . checked($value, true, false) . ' />';
        echo '<label>Chatbot automatisch beim Seitenaufruf öffnen</label>';
    }
    
    public function welcome_message_field_callback() {
        $value = $this->get_option('welcome_message', 'Hallo! Wie kann ich Ihnen helfen?');
        echo '<input type="text" name="helferlain_chatbot_settings[welcome_message]" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Begrüßungsnachricht die beim Öffnen des Chatbots angezeigt wird.</p>';
    }
    
    public function enable_on_all_pages_field_callback() {
        $value = $this->get_option('enable_on_all_pages', true);
        echo '<input type="checkbox" name="helferlain_chatbot_settings[enable_on_all_pages]" value="1"' . checked($value, true, false) . ' />';
        echo '<label>Chatbot auf allen Seiten automatisch anzeigen</label>';
    }
    
    public function analytics_enabled_field_callback() {
        $value = $this->get_option('analytics_enabled', true);
        echo '<input type="checkbox" name="helferlain_chatbot_settings[analytics_enabled]" value="1"' . checked($value, true, false) . ' />';
        echo '<label>Analytics und Tracking aktivieren</label>';
    }
    
    // Helper Methods
    private function get_option($key, $default = null) {
        return isset($this->options[$key]) ? $this->options[$key] : $default;
    }
    
    private function get_bot_id() {
        return $this->get_option('bot_id', '');
    }
    
    private function get_api_endpoint() {
        return $this->get_option('api_endpoint', 'https://api.helferlain.app');
    }
    
    private function should_load_chatbot() {
        // Prüfe ob Bot ID konfiguriert ist
        if (empty($this->get_bot_id())) {
            return false;
        }
        
        // Prüfe ob aktuelle Seite ausgeschlossen ist
        $exclude_pages = $this->get_option('exclude_pages', array());
        if (!empty($exclude_pages) && is_array($exclude_pages)) {
            global $post;
            if ($post && in_array($post->ID, $exclude_pages)) {
                return false;
            }
        }
        
        // Prüfe Admin-Bereich
        if (is_admin()) {
            return false;
        }
        
        return true;
    }
    
    public function ajax_preview() {
        // AJAX Handler für Live-Vorschau im Admin
        check_ajax_referer('helferlain_preview', 'nonce');
        
        $bot_id = sanitize_text_field($_POST['bot_id']);
        $response = array('success' => true, 'html' => $this->shortcode_handler(array('bot_id' => $bot_id, 'inline' => true)));
        
        wp_send_json($response);
    }
}

// Plugin initialisieren
new HelferLainChatbot();

// Uninstall Hook
register_uninstall_hook(__FILE__, 'helferlain_chatbot_uninstall');

function helferlain_chatbot_uninstall() {
    // Alle Plugin-Optionen löschen
    delete_option('helferlain_chatbot_settings');
    
    // Transients löschen
    delete_transient('helferlain_chatbot_cache');
}
?>