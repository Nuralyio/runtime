import { css } from 'lit';

export default  css`
  :host {
      display: block;
      font-family: 'Arial', sans-serif;
      max-width: 100%;
      height: 100%;
      box-sizing: border-box;
  }

  .chat-box {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 9px;
      overflow: hidden;
  }

  .messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: linear-gradient(135deg, #f3f4f6, #ffffff);
      max-height: calc(100% - 60px);
  }

  .suggestion-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
  }

  :host([dir='rtl']) .suggestion-container {
      flex-direction: row-reverse;
  }

  .suggestion {
      display: inline-flex;
      align-items: center;
      background-color: #2663eb1a;
      padding: 8px 12px;
      border-radius: 16px;
      cursor: pointer;
      font-size: 14px;
      color: #333333;
      white-space: nowrap;
      transition: background-color 0.3s ease;
      text-wrap: auto;
  }

  .suggestion:hover {
      background-color: #d5d8f1;
  }

  .message {
      display: inline-block;
      max-width: 70%;
      padding: 12px;
      border-radius: 16px;
      position: relative;
      word-wrap: break-word;
      font-size: 14px;
  }

  .user {
      background-color: #d1f7e0;
      align-self: flex-end;
      border-radius: 16px 16px 0 16px;
      color: #1b4332;
  }

  .bot {
      background-color: #eef1f6;
      align-self: flex-start;
      border-radius: 16px 16px 16px 0;
      color: #333333;
  }

  .error {
      background-color: #fdecea;
      color: #d93025;
      border: 1px solid #d93025;
      position: relative;
  }

  .introduction {
      font-size: 16px;
  }

  .error .retry {
      display: inline-block;
      margin-top: 8px;
      color: #007bff;
      cursor: pointer;
      font-size: 12px;
      text-decoration: underline;
  }

  :host([dir='rtl']) .user {
      align-self: flex-start;
      border-radius: 16px 16px 16px 0;
  }

  :host([dir='rtl']) .bot {
      align-self: flex-end;
      border-radius: 16px 0 16px 16px;
  }

  .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #eef1f6;
      border-radius: 16px;
      padding: 10px;
      color: #888888;
      font-style: italic;
  }

  .dots span {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin: 0 1px;
      background-color: #888888;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
  }

  .input-box {
      display: flex;
      border-top: 1px solid #ddd;
      background-color: #f9fafb;
      flex-direction: row;
  }

  :host([dir='rtl']) .input-box {
      flex-direction: row-reverse;
  }

  input {
      flex: 1;
      padding: 12px;
      font-size: 14px;
      border: none;
      outline: none;
      background-color: #f9fafb;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      max-width: 100%;
  }

  :host([dir='rtl']) input {
      text-align: right;
  }

  button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 12px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
  }

  :host([dir='rtl']) button {
      border-bottom-left-radius: 4px;
  }

  button:hover {
      background-color: #1d4ed8;
  }

  @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
  }

  .loading .dots {
      display: flex;
      align-items: center;
  }

  .loading .dots span {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin: 0 2px;
      background-color: #888888;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
  }

  .loading .dots span:nth-child(2) {
      animation-delay: 0.4s;
  }

  .loading .dots span:nth-child(3) {
      animation-delay: 0.8s;
  }
`;