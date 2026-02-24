<#macro kw content="" footer="" header="">
  <div class="flex-1 flex flex-col justify-center mx-auto" style="width: 100%; min-width: 400px; max-width: 500px;">
    <#if header?has_content>
      <div class="space-y-2 mb-8">
        ${header}
      </div>
    </#if>
    <#if content?has_content>
      <div class="space-y-6">
        ${content}
      </div>
    </#if>
    <#if footer?has_content>
      <div class="mt-8">
        ${footer}
      </div>
    </#if>
  </div>
</#macro>
