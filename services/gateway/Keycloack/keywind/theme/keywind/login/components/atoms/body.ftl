<#macro kw>
  <style>
    @media (max-width: 768px) {
      .login-right-panel {
        display: none !important;
      }
      .login-left-panel {
        min-width: 100% !important;
      }
      .login-left-panel .justify-center {
        justify-content: flex-start !important;
        padding-top: 2rem !important;
      }
      .nuraly-logo {
        align-items: center !important;
        text-align: center !important;
        margin-bottom: 3rem !important;
      }
    }
  </style>
  <body class="flex min-h-screen">
    <#-- Left panel: Form area -->
    <div class="login-left-panel flex flex-col overflow-y-auto items-center justify-center" style="flex: 1; min-width: 50%; background: linear-gradient(135deg, #f8fafc 0%, #e8e8f0 100%);">
      <#nested>
    </div>
    <#-- Right panel: Background image (hidden on mobile) -->
    <div class="login-right-panel relative overflow-hidden" style="flex: 1; background-image: url('${url.resourcesPath}/img/login-bg.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
    </div>
  </body>
</#macro>
