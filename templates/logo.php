<?php
/**
 * Template part for displaying the site logo
 */
?>
<div class="site-logo">
    <?php
    if ( function_exists( 'the_custom_logo' ) && has_custom_logo() ) {
        the_custom_logo();
    } else {
        echo '<a href="' . esc_url( home_url( '/' ) ) . '" rel="home">';
        echo '<img src="' . get_template_directory_uri() . '/assets/images/logo.png" alt="' . get_bloginfo('name') . '">';
        echo '</a>';
    }
    ?>
</div>