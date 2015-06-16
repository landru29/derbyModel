<?php
class Track_Tinymce
{
    public function __construct()
    {
        add_action('admin_init', array($this, 'button'));
        add_action('init', array($this, 'display'));
    }

    public function button()
    {
        if( current_user_can('edit_posts') &&  current_user_can('edit_pages') )
            {
                add_filter( 'mce_external_plugins', array($this, 'add_buttons' ));
                add_filter( 'mce_buttons', array($this, 'register_buttons' ));
            }
    }

    public function add_buttons( $plugin_array )
    {
        $plugin_array['derby_track'] = plugin_dir_url(dirname( __FILE__ )) . 'js/tinymce-button.js';
        return $plugin_array;
    }

    public function register_buttons( $buttons )
    {
        array_push( $buttons, 'separator', 'derby_track' );
        return $buttons;
    }

    public function display()
    {
        add_shortcode('derby_track', function(){
            $id = uniqid('quiz-bonhommes-');
            echo '<div id="' . $id . '" class="quiz"></div>';
            echo '<script>';
            echo 'jQuery(document).ready(function(){';
            echo 'var myScene = new $derby.Scene({scale:0.2});';
            echo 'jQuery(\'div#' . $id . '\').get(0).appendChild(myScene.getElement());';
            echo '});';
            echo '</script>';
        });
    }

}