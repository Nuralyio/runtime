<#macro
  kw
  autofocus=false
  disabled=false
  invalid=false
  label=""
  message=""
  name=""
  required=true
  rest...
>
  <div class="relative">
    <input
      <#if autofocus>autofocus</#if>
      <#if disabled>disabled</#if>
      <#if required>required</#if>

      aria-invalid="${invalid?c}"
      class="peer block w-full px-4 py-3 border-2 <#if invalid>border-red-400 focus:border-red-500<#else>border-secondary-300 focus:border-primary-500</#if> bg-transparent placeholder-transparent focus:outline-none focus:ring-0 transition-colors"
      id="${name}"
      name="${name}"
      placeholder="${label}"

      <#list rest as attrName, attrValue>
        ${attrName}="${attrValue}"
      </#list>
    >
    <label
      class="absolute left-3 -top-2.5 px-1 text-sm <#if invalid>text-red-500<#else>text-primary-500 peer-placeholder-shown:text-secondary-400</#if> peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm <#if invalid>peer-focus:text-red-500<#else>peer-focus:text-primary-500</#if> transition-all cursor-text"
      style="background: linear-gradient(to bottom, transparent 50%, #f0f0f4 50%);"
      for="${name}"
    >
      ${label}
    </label>
    <#if invalid && message?has_content>
      <div class="mt-2 text-red-500 text-sm">
        ${message?no_esc}
      </div>
    </#if>
  </div>
</#macro>
