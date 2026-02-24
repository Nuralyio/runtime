<#import "/assets/providers/providers.ftl" as providerIcons>

<#macro kw providers=[]>
  <div class="relative my-6">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-secondary-200"></div>
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-4 bg-white text-secondary-500">${msg("identity-provider-login-label")}</span>
    </div>
  </div>
  <div class="flex flex-wrap justify-center gap-3">
    <#list providers as provider>
      <#switch provider.alias>
        <#case "apple">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-apple">
          <#break>
        <#case "bitbucket">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-bitbucket">
          <#break>
        <#case "discord">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-discord">
          <#break>
        <#case "facebook">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-facebook">
          <#break>
        <#case "github">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-github">
          <#break>
        <#case "gitlab">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-gitlab">
          <#break>
        <#case "google">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-google">
          <#break>
        <#case "instagram">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-instagram">
          <#break>
        <#case "linkedin-openid-connect">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-linkedin">
          <#break>
        <#case "microsoft">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-microsoft">
          <#break>
        <#case "oidc">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-oidc">
          <#break>
        <#case "openshift-v3">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-openshift">
          <#break>
        <#case "openshift-v4">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-openshift">
          <#break>
        <#case "paypal">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-paypal">
          <#break>
        <#case "slack">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-slack">
          <#break>
        <#case "stackoverflow">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-stackoverflow">
          <#break>
        <#case "twitter">
          <#assign colorClass="hover:bg-secondary-50 hover:border-provider-twitter">
          <#break>
        <#default>
          <#assign colorClass="hover:bg-secondary-50 hover:border-secondary-400">
      </#switch>

      <a
        class="${colorClass} bg-white border-2 border-secondary-200 flex items-center justify-center w-16 h-12 sm:w-20 sm:h-14 rounded-xl transition-all duration-200"
        data-provider="${provider.alias}"
        href="${provider.loginUrl}"
        type="button"
        title="${provider.displayName!}"
      >
        <#if providerIcons[provider.alias]??>
          <div class="h-6 w-6 sm:h-7 sm:w-7">
            <@providerIcons[provider.alias] />
          </div>
        <#else>
          <span class="text-xs font-medium text-secondary-600">${provider.displayName!}</span>
        </#if>
      </a>
    </#list>
  </div>
</#macro>
