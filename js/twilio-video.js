var conversationsClient;
var activeConversation;
var previewMedia;

// check for WebRTC
if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
  alert('WebRTC is not available in your browser.');
}

jQuery(function() {

	jQuery.ajax({ url: "/wp-content/plugins/twilio-video/twilio-video.html" }).done(function( content ) {
		jQuery(content).appendTo('body')

		document.getElementById('enter-queue').onclick = function () {
			jQuery('#agent-prompt').toggle();
			jQuery('#wait-interstitial').toggle();
		};
		
		jQuery.getJSON('/wp-json/twilio-video-api/v1/twilio-video-token', function(data) {
    	identity = data.identity;
	    var accessManager = new Twilio.AccessManager(data.token);

	    // Check the browser console to see your generated identity. 
  	  // Send an invite to yourself if you want! 
    	console.log(identity);

	    // Create a Conversations Client and connect to Twilio
  	  conversationsClient = new Twilio.Conversations.Client(accessManager);
    	conversationsClient.listen().then(clientConnected, function (error) {
    	  console.log('Could not connect to Twilio: ' + error.message);
	    });
		});
	});


// Successfully connected!
	function clientConnected() {
    //document.getElementById('invite-controls').style.display = 'block';
    console.log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");

    conversationsClient.on('invite', function (invite) {
        console.log('Incoming invite from: ' + invite.from);
        invite.accept().then(conversationStarted);
    });
  }
  
  // Conversation is live
	function conversationStarted(conversation) {

		jQuery('#wait-interstitial').toggle();
		jQuery('#conversation-view').toggle();
	
    console.log('In an active Conversation');
    activeConversation = conversation;
    // Draw local video, if not already previewing
    if (!previewMedia) {
        conversation.localMedia.attach('#local-media');
    }

    // When a participant joins, draw their video on screen
    conversation.on('participantConnected', function (participant) {
        console.log("Participant '" + participant.identity + "' connected");
        participant.media.attach('#remote-media');
    });

    // When a participant disconnects, note in log
    conversation.on('participantDisconnected', function (participant) {
        console.log("Participant '" + participant.identity + "' disconnected");
    });

    // When the conversation ends, stop capturing local video
    conversation.on('ended', function (conversation) {
        console.log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");
        conversation.localMedia.stop();
        conversation.disconnect();
        activeConversation = null;
    });
	};
});
