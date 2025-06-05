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
      // Create a simple HTML page as a data URL
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Initiative Tracker</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px; }
              h1 { text-align: center; }
              .card { background-color: #333; margin: 10px 0; padding: 15px; border-radius: 5px; }
              .highlight { background-color: #0069d9; }
            </style>
          </head>
          <body>
            <h1>Initiative Order</h1>
            <div id="content"></div>
            <script>
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
                  const message = document.createElement('div');
                  message.textContent = 'No initiative data available';
                  contentDiv.appendChild(message);
                }
              } catch (e) {
                document.body.innerHTML += '<div>Error: ' + e.message + '</div>';
              }
            </script>
          </body>
        </html>
      `;
      
      // Convert HTML to a data URL
      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      
      // Create a media info object for the default receiver
      const mediaInfo = new window.chrome.cast.media.MediaInfo(dataUrl, 'text/html');
      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      
      castSession.loadMedia(request);
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