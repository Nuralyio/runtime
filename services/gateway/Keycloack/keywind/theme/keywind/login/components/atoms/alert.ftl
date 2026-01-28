<#macro kw color="">
  <#switch color>
    <#case "error">
      <#assign colorClass="bg-red-50 text-red-700 border-red-200">
      <#assign iconColor="text-red-500">
      <#break>
    <#case "info">
      <#assign colorClass="bg-blue-50 text-blue-700 border-blue-200">
      <#assign iconColor="text-blue-500">
      <#break>
    <#case "success">
      <#assign colorClass="bg-green-50 text-green-700 border-green-200">
      <#assign iconColor="text-green-500">
      <#break>
    <#case "warning">
      <#assign colorClass="bg-amber-50 text-amber-700 border-amber-200">
      <#assign iconColor="text-amber-500">
      <#break>
    <#default>
      <#assign colorClass="bg-blue-50 text-blue-700 border-blue-200">
      <#assign iconColor="text-blue-500">
  </#switch>

  <div class="${colorClass} border px-4 py-3 rounded-xl text-sm flex items-start gap-3" role="alert">
    <svg class="${iconColor} w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <#if color == "error">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <#elseif color == "success">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <#elseif color == "warning">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      <#else>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </#if>
    </svg>
    <div class="flex-1">
      <#nested>
    </div>
  </div>
</#macro>
