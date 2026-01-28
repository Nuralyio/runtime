<#macro kw color="" component="button" size="" rest...>
  <#switch color>
    <#case "primary">
      <#assign colorClass="bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/30">
      <#break>
    <#case "secondary">
      <#assign colorClass="bg-white text-secondary-700 border-2 border-secondary-200 hover:bg-secondary-50 hover:border-secondary-300">
      <#break>
    <#default>
      <#assign colorClass="bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/30">
  </#switch>

  <#switch size>
    <#case "medium">
      <#assign sizeClass="px-6 py-3 text-base">
      <#break>
    <#case "small">
      <#assign sizeClass="px-4 py-2 text-sm">
      <#break>
    <#default>
      <#assign sizeClass="px-6 py-3.5 text-base font-semibold">
  </#switch>

  <${component}
    class="${colorClass} ${sizeClass} flex justify-center items-center relative rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"

    <#list rest as attrName, attrValue>
      ${attrName}="${attrValue}"
    </#list>
  >
    <#nested>
  </${component}>
</#macro>
