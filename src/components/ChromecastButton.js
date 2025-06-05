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
    if (castSession && content.length > 0) {
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
    if (content.length > 0) {
      sendMessage(content);
    }
  };

  const receiverListener = (availability) => {
    setCastingAvailable(availability === window.chrome.cast.ReceiverAvailability.AVAILABLE);
  };

  const startCasting = () => {
    if (window.chrome && window.chrome.cast) {
      window.chrome.cast.requestSession(sessionListener);
    }
  };

  const stopCasting = () => {
    if (castSession) {
      castSession.leave();
      setCastSession(null);
    }
  };

  const sendMessage = (content) => {
    if (castSession) {
      const htmlContent = `
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
              const data = ${JSON.stringify(content)};
              const contentDiv = document.getElementById('content');
              
              data.forEach((character) => {
                const card = document.createElement('div');
                card.className = 'card' + (character.selected ? ' highlight' : '');
                card.textContent = character.name + ' - ' + character.initiative;
                contentDiv.appendChild(card);
              });
            </script>
          </body>
        </html>
      `;

      castSession.sendMessage('urn:x-cast:com.nullsheen.initiativetracker', htmlContent);
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