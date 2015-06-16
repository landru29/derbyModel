<?php
/**
 * Plugin Name: Track-Simulator
 * Description: Provide an interactive roller derby track
 * Version: 1.0.0
 * Author: Cyrille Meichel
 * Author URI: http://derby.parseapp.com
 * Text Domain: derbytrack
 * Domain Path: /locale/
 * Network: true
 * License: GPL2
 */



class Derby_Track_Plugin
{
    public function __construct()
    {
        include_once plugin_dir_path( __FILE__ ).'/services/widget.php';
        include_once plugin_dir_path( __FILE__ ).'/services/tinymce.php';

        // track script
        wp_enqueue_script( 'track', plugin_dir_url( __FILE__ ) . '/js/roller-derby-model.min.js', '1.0.0', true );
        // quizz style
        wp_enqueue_style( 'track', plugin_dir_url( __FILE__ ) . '/css/roller-derby-model.min.css', array(), '1.0.0');
        // add entry in the editor
        new Track_Tinymce();

        // register the widget
        add_action('widgets_init', function() {register_widget('Derby_Track_Widget');});

        // Add 'settings' in the plugin panel
        /*add_filter( 'plugin_action_links_' . plugin_basename(__FILE__), function( $links ) {
            $mylinks = array(
                '<a href="' . admin_url( 'options-general.php?page=quiz-bonhommes-key-config' ) . '">Settings</a>',
            );
            return array_merge( $links, $mylinks );
        });*/

        // Intance to options object
        //$options = new Quiz_Bonhommes_Options();

        // Add options submenu in config panel
        /*add_action('admin_menu', function() {
             add_options_page('Quiz', 'Quiz', 'manage_options', 'quiz-bonhommes-key-config', array(new Quiz_Bonhommes_Options(), 'display_page') );
        });*/

    }

}

new Derby_Track_Plugin();
