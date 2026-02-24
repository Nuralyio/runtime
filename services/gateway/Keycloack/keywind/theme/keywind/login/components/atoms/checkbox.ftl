<#macro kw checked=false label="" name="" rest...>
  <div class="flex items-center">
    <input
      <#if checked>checked</#if>

      class="border-2 border-secondary-300 h-5 w-5 rounded text-primary-500 focus:ring-primary-500 focus:ring-offset-0 transition-colors cursor-pointer"
      id="${name}"
      name="${name}"
      type="checkbox"

      <#list rest as attrName, attrValue>
        ${attrName}="${attrValue}"
      </#list>
    >
    <label class="ml-3 text-secondary-600 text-sm cursor-pointer select-none" for="${name}">
      ${label}
    </label>
  </div>
</#macro>
