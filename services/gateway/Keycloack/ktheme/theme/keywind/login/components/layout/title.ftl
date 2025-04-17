<#macro kw>
  <div class="font-bold text-center " style="
    font-size: 90px;
    line-height: 6rem;
    text-transform: capitalize;
">
    ${kcSanitize(msg("loginTitleHtml", (realm.displayNameHtml!"")))?no_esc}
  </div>
</#macro>
