<?php
/**
 * Plugin Name: Twilio Video
 * Plugin URI: http://twilio.com
 * Description: This plugin the ability to have a video conversation within a wordpress site.
 * Version: 1.0.0
 * Author: Devin Rader
 * Author URI: http://twilio.com
 * License: MIT
 */

define('TWILIO_VIDEO_PLUGIN_URL', plugin_dir_url(__FILE__));
 
add_action( 'wp_enqueue_scripts', 'twilio_video_enqueue_scripts' );
add_action( 'rest_api_init', 'twilio_video_register_api_routes' );

function twilio_video_enqueue_scripts() {
	wp_enqueue_style( 'twilio-video-css', TWILIO_VIDEO_PLUGIN_URL . 'css/twilio-video.css');
	
	wp_enqueue_script( 'jquery' );		
	wp_enqueue_script( 'twilio-common', 'https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js');
	wp_enqueue_script( 'twilio-conversations', 'https://media.twiliocdn.com/sdk/js/conversations/v0.13/twilio-conversations.min.js');	
    wp_enqueue_script( 'twilio-video-js', TWILIO_VIDEO_PLUGIN_URL . 'js/twilio-video.js' );
}

function twilio_video_register_api_routes() {

	$namespace = 'twilio-video-api/v1';

	register_rest_route( $namespace, '/twilio-video-token/', array(
	    'methods' => 'GET',
        'callback' => 'twilio_video_get_token') 
	);
}

function twilio_video_get_token() {

	require_once ('lib/Twilio/Twilio.php');
	require_once ('randos.php');

	// An identifier for your app - can be anything you'd like
	$appName = 'TwilioVideoDemo';

	// choose a random username for the connecting user
	$identity = randomUsername();

	// Create access token, which we will serialize and send to the client
	$token = new Services_Twilio_AccessToken(
    /*$TWILIO_ACCOUNT_SID, */
    /*$TWILIO_API_KEY, */
    /*$TWILIO_API_SECRET, */
    3600, 
    $identity
	);
	
	// Grant access to Conversations
	$grant = new Services_Twilio_Auth_ConversationsGrant();
	$grant->setConfigurationProfileSid(/*$TWILIO_CONFIGURATION_SID*/);
	$token->addGrant($grant);

	$return = array(
    'identity' => $identity,
    'token' => $token->toJWT(),
	);

	$response = new WP_REST_Response( $return );
	return $response;
}
?>