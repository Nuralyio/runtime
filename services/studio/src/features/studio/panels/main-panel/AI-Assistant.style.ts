import { css } from "lit";


export default css`
    :host {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: none;
        color-scheme: light dark;
        transition: color 0.3s ease, background-color 0.3s ease;
    }

    :host([visible]) {
        display: block;
    }

    .chat-bubble {
        display: flex;
        flex-direction: column;
        background: var(--bubble-bg, #ffffff);
        color: var(--text-color, #000000);
        border-radius: 20px;
        box-shadow: 0 4px 10px var(--shadow-color, rgba(0, 0, 0, 0.1));
        padding: 15px;
        width: 550px;
        max-width: 90%;
        cursor: grab;
        transition: background-color 0.3s ease, color 0.3s ease,
        box-shadow 0.3s ease;
    }

    .chat-bubble:active {
        cursor: grabbing;
    }

    .message-container {
        margin-bottom: 10px;
    }

    .last-message {
        background: var(--message-bg, #f1f1f1);
        color: var(--text-color, #000000);
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 5px;
        max-height: 500px;
        overflow: auto;
        font-size: 14px;
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .input-container {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    input {
        flex: 1;
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        background: var(--input-bg, #ffffff);
        color: var(--text-color, #000000);
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        transition: background-color 0.3s ease, color 0.3s ease,
        border-color 0.3s ease;
    }

    input::placeholder {
        color: var(--placeholder-color, #666);
    }

    button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: var(--button-bg, #007bff);
        color: var(--button-text, #ffffff);
        border: none;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    button:hover:enabled {
        background: var(--button-hover, #0056b3);
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* A simple spinner for inside the button */
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid var(--button-text, #ffffff);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    :host {
        --bubble-bg: #ffffff;
        --text-color: #000000;
        --message-bg: #f1f1f1;
        --input-bg: #ffffff;
        --border-color: #ddd;
        --button-bg: #007bff;
        --button-hover: #0056b3;
        --button-text: #ffffff;
        --placeholder-color: #666;
        --shadow-color: rgba(0, 0, 0, 0.1);
    }

    :host([dark]) {
        --bubble-bg: #2d2d2d;
        --text-color: #ffffff;
        --message-bg: #3d3d3d;
        --input-bg: #404040;
        --border-color: #505050;
        --button-bg: #0066cc;
        --button-hover: #0052a3;
        --button-text: #ffffff;
        --placeholder-color: #aaa;
        --shadow-color: rgba(0, 0, 0, 0.2);
    }
`;
