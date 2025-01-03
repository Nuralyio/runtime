import { css } from 'lit';

export default css`
    :host {
        display: block;
        font-family: 'Arial', sans-serif;
        position: relative;
        width: 100%;
        height: 100%;
    }

    .bottom-container {
        position: fixed;
        bottom: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .fab-button {
        position: fixed;
        bottom: 20px;
        background-color: #2563eb;
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        font-size: 30px;
        transition: background-color 0.3s ease, transform 0.3s ease, right 0.3s ease,
        left 0.3s ease;
        user-select: none;
    }

    .fab-button:hover {
        background-color: #1d4ed8;
        transform: scale(1.1);
    }

    .fab-button svg {
        width: 30px;
        height: 30px;
        fill: white;
    }

    .fab-button.ltr {
        right: 20px;
    }

    .fab-button.rtl {
        left: 20px;
    }

    .chat-box-container {
        position: fixed;
        bottom: 145px;
        width: 400px;
        height: 500px;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9998;
        flex-direction: column;
        background-color: white;
        border-radius: 8px;
        transition: opacity 0.1s ease-in-out, visibility 0.1s ease-in-out,
        transform 0.3s ease, width 0.3s ease, height 0.3s ease;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
    }

    .chat-box-container.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .chat-box-container.ltr {
        right: 10px;
    }

    .chat-box-container.rtl {
        left: 10px;
    }

    .chat-box-header {
        display: flex;
        justify-content: flex-end;
        padding: 10px;
        background-color: #2563eb;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .icon-button {
        background: none;
        border: none;
        cursor: pointer;
        width: 32px;
        height: 32px;
        transition: transform 0.3s ease;
    }

    .icon-button:hover {
        transform: scale(1.3);
    }

    .icon-button svg {
        width: 100%;
        height: 100%;
        fill: white;
    }

    @media (max-width: 768px) {
        .chat-box-container {
            right: 10px;
            width: calc(100% - 20px);
            height:  calc(100% - 130px);
            bottom: 100px;
        }

        .chat-box-container.open {
            transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out,
            transform 0.5s ease, width 0.5s ease, height 0.5s ease;
        }

        .fab-button {
            bottom: 20px;
            transition: transform 0.5s ease, right 0.5s ease, left 0.5s ease;
        }
    }
`