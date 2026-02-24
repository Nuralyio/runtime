<#macro kw subtitle="">
  <#if subtitle?has_content>
    <p class="text-secondary-500 text-base mb-2">${subtitle}</p>
  </#if>
  <h1 class="text-2xl sm:text-3xl font-bold text-secondary-900">
    <#nested>
  </h1>
</#macro>
