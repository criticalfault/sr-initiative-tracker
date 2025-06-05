import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const ChromecastButton = ({ content }) => {
  const [castingAvailable, setCastingAvailable] = useState(false);
  const [castSession, setCastSession] = useState(null);

  useEffect(() => {
    if (window.chrome && window.chrome.cast) {
      initializeCastApi();
    } else {
      window.__onGCastApiAvailable = function(isAvailable) {
        if (isAvailable) {
          initializeCastApi();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (castSession && content && content.length > 0) {
      sendMessage(content);
    }
  }, [content, castSession]);

  const initializeCastApi = () => {
    const sessionRequest = new window.chrome.cast.SessionRequest(
      window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    );
    
    const apiConfig = new window.chrome.cast.ApiConfig(
      sessionRequest,
      sessionListener,
      receiverListener
    );
    
    window.chrome.cast.initialize(apiConfig);
  };

  const sessionListener = (session) => {
    setCastSession(session);
    if (content && content.length > 0) {
      sendMessage(content);
    }
  };

  const receiverListener = (availability) => {
    setCastingAvailable(availability === window.chrome.cast.ReceiverAvailability.AVAILABLE);
  };

  const startCasting = () => {
    if (window.chrome && window.chrome.cast) {
      window.chrome.cast.requestSession(
        sessionListener,
        (error) => console.error('Error requesting session:', error)
      );
    }
  };

  const stopCasting = () => {
    if (castSession) {
      castSession.leave(
        () => setCastSession(null),
        (error) => console.error('Error ending session:', error)
      );
    }
  };

  const sendMessage = (content) => {
    if (castSession) {
      try {
        // Create a simple HTML page as a string
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Initiative Tracker</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  background-color: #000; 
                  color: #fff; 
                  padding: 20px; 
                  margin: 0;
                  overflow: hidden;
                }
                h1 { 
                  text-align: center; 
                  margin-bottom: 30px;
                }
                .card { 
                  background-color: #333; 
                  margin: 15px 0; 
                  padding: 20px; 
                  border-radius: 8px;
                  font-size: 24px;
                }
                .highlight { 
                  background-color: #0069d9; 
                }
                #error-message {
                  color: red;
                  text-align: center;
                  padding: 20px;
                  font-size: 20px;
                }
              </style>
            </head>
            <body>
              <h1>Initiative Order</h1>
              <div id="content"></div>
              <div id="error-message"></div>
              <script>
                window.onload = function() {
                  try {
                    const data = ${JSON.stringify(content)};
                    const contentDiv = document.getElementById('content');
                    
                    if (data && data.length > 0) {
                      data.forEach(function(character) {
                        const card = document.createElement('div');
                        card.className = 'card' + (character.selected ? ' highlight' : '');
                        card.textContent = character.name + ' - ' + character.initiative;
                        contentDiv.appendChild(card);
                      });
                    } else {
                      document.getElementById('error-message').textContent = 'No initiative data available';
                    }
                  } catch (e) {
                    document.getElementById('error-message').textContent = 'Error: ' + e.message;
                  }
                };
              </script>
            </body>
          </html>
        `;
        
        // Use a web server URL if possible instead of data URL
        // For now, we'll still use data URL but with improved formatting
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        
        // Create a media info object with proper settings
        const mediaInfo = new window.chrome.cast.media.MediaInfo(dataUrl, 'text/html');
        
        // Add metadata to improve the casting experience
        const metadata = new window.chrome.cast.media.GenericMediaMetadata();
        metadata.title = 'Initiative Tracker';
        metadata.subtitle = 'Shadowrun Initiative Order';
        mediaInfo.metadata = metadata;
        
        // Set autoplay to true
        mediaInfo.autoplay = true;
        
        // Create and send the request
        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        
        castSession.loadMedia(
          request,
          () => console.log('Media loaded successfully'),
          (error) => console.error('Error loading media:', error)
        );
      } catch (error) {
        console.error('Error in sendMessage:', error);
      }
    }
  };

  return (
    <Button 
      onClick={castSession ? stopCasting : startCasting}
      disabled={!castingAvailable && !castSession}
      variant={castSession ? "danger" : "primary"}
      className="mb-2"
    >
      {castSession ? 'Stop Casting' : 'Cast to TV'}
    </Button>
  );
};

export default ChromecastButton;