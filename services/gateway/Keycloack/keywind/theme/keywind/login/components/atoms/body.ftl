<#macro kw>
  <body class="flex min-h-screen">
    <#-- Left panel: Form area -->
    <div class="w-full lg:w-1/2 flex flex-col bg-white overflow-y-auto">
      <#nested>
    </div>
    <#-- Right panel: Abstract art background with animated gradient fallback -->
    <div class="hidden lg:flex lg:w-1/2 login-bg-panel relative overflow-hidden">
      <#-- Background image overlay (if available) -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${url.resourcesPath}/img/login-bg.jpg');"></div>
      <#-- Decorative elements -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-purple-500/20"></div>
      <#-- Animated floating shapes -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>
  </body>
</#macro>
