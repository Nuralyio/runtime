import { css } from "lit";

export default css`
            :host {
              display:flex;
              align-items:center;
            }
            .chat-input-container {
                position: relative;
                display: inline-block;
                width: 100%;
            }
            .chat-input {
                display: flex;
                margin-top: 10px;
                width: 100%;
            }
            .chat-input nr-input {
                flex: 1;
                margin-right: 10px;
            }
            .chat-messages {
                margin-top: 10px;
                max-height: 200px;
                overflow-y: auto;
                background-color: #f9f9f9;
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .chat-message {
                border-radius: 16px;
                padding: 8px 12px;
                margin-bottom: 8px;
                max-width: 80%;
                word-wrap: break-word;
            }
            .ai-message {
                background-color: #d1fae5;
                align-self: flex-start;
            }
            .error-message {
                color: red;
                margin-top: 10px;
            }
            .loading-indicator {
                margin-top: 10px;
                font-size: 14px;
                color: #555;
            }
        `;