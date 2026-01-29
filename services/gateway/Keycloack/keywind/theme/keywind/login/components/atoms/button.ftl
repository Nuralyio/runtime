<#macro kw color="" component="button" size="" rest...>
  <#switch color>
    <#case "primary">
      <#assign colorClass="bg-primary-700 text-white border-2 border-primary-700 hover:bg-primary-500 hover:border-primary-500">
      <#break>
    <#case "secondary">
      <#assign colorClass="bg-transparent text-primary-700 border-2 border-primary-700 hover:bg-primary-700 hover:text-white">
      <#break>
    <#default>
      <#assign colorClass="bg-primary-700 text-white border-2 border-primary-700 hover:bg-primary-500 hover:border-primary-500">
  </#switch>

  <#switch size>
    <#case "medium">
      <#assign sizeClass="px-6 py-3 text-xs">
      <#break>
    <#case "small">
      <#assign sizeClass="px-4 py-2 text-xs">
      <#break>
    <#default>
      <#assign sizeClass="px-6 py-3.5 text-xs">
  </#switch>

  <${component}
    class="${colorClass} ${sizeClass} flex justify-center items-center relative w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-150 uppercase tracking-widest font-semibold"

    <#list rest as attrName, attrValue>
      ${attrName}="${attrValue}"
    </#list>
  >
    <#nested>
  </${component}>
</#macro>
