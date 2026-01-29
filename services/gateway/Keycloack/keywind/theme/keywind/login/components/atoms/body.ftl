<#macro kw>
  <body class="flex min-h-screen">
    <#-- Left panel: Form area -->
    <div class="flex flex-col overflow-y-auto items-center justify-center" style="flex: 1; min-width: 50%; background: linear-gradient(135deg, #f8fafc 0%, #e8e8f0 100%);">
      <#nested>
    </div>
    <#-- Right panel: Background image -->
    <div class="relative overflow-hidden" style="flex: 1; background-image: url('${url.resourcesPath}/img/login-bg.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
    </div>
  </body>
</#macro>
