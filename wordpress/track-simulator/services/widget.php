<?php
class Derby_Track_Widget extends WP_Widget
{
    public function __construct()
    {
        parent::__construct('Derby_Track', 'Roller Derby Track', array('description' => 'Interactive track'));
        $this->id = uniqid('derby-track-');
    }

    public function widget($args, $instance)
    {
        echo '<div id="' . $this->id . '" class="quiz"></div>';
        echo '<script>';
        echo 'jQuery(document).ready(function(){';
        echo 'var myScene = new $derby.Scene({scale:0.2});';
        echo 'jQuery(\'div#' . $this->id . '\').get(0).appendChild(myScene.getElement());';
        echo '});';
        echo '</script>';
    }
}