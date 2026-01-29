<#macro kw color="" component="a" size="" rest...>
  <#switch color>
    <#case "primary">
      <#assign colorClass="text-primary-500 hover:text-primary-600 font-medium">
      <#break>
    <#case "secondary">
      <#assign colorClass="text-secondary-500 hover:text-secondary-700">
      <#break>
    <#default>
      <#assign colorClass="text-primary-500 hover:text-primary-600 font-medium">
  </#switch>

  <#switch size>
    <#case "small">
      <#assign sizeClass="text-sm">
      <#break>
    <#default>
      <#assign sizeClass="">
  </#switch>

  <${component}
    class="<#compress>${colorClass} ${sizeClass} inline-flex transition-colors</#compress>"

    <#list rest as attrName, attrValue>
      ${attrName}="${attrValue}"
    </#list>
  >
    <#nested>
  </${component}>
</#macro>
