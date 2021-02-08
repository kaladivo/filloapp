# Filloapp
Small but useful documentation


## user Permissions

Lives in `user_customer.permissions` table.   
User automatically gets all permissions above the permission he has set to true.

## Blueprints
`canSeeAllBlueprints: boolean` - if true user can see all blueprints in his customer. Otherwise only those created by himself   
`canModifyAllBlueprints: boolean` - if true user can edit/delete all blueprints in his customer. Otherwise only those created by himself   


### Blueprints groups
`canSeeAllBlueprintsGroups: boolean` - if true user can see all blueprints groups in his customer. Otherwise only those created by himself   
`canModifyAllBlueprintsGroups: boolean` - if true user can see all blueprints groups in his customer. Otherwise only those created by himself   
`canSeeAllBlueprintsGroupsSubmits: boolean` - if true user can see all blueprints groups in his customer. Otherwise only those created by himself   

### Others
`admin: boolean` - users with this permission automatically gets all permissions set to `true`

[auth playground link](https://developers.google.com/oauthplayground/#step2&scopes=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&auth_code=4%2F0AY0e-g7WDkE9_0aruyJta9-T9OCrDDBTlWCeXlxZi_wJWeCoNhWOtGeIhP6ODOBYeTnZ9g&refresh_token=1%2F%2F04Zr23qEfdjYJCgYIARAAGAQSNwF-L9IrBd4Woo57YDhW30mVI6ubYP4CFUxPY8HxTXOi733vvSWuahizIweOh3VtgUs9xCi9rtU&access_token_field=ya29.a0AfH6SMDaSd3riohIzeVyfI-FYuMZ8_31eQr3ySihf2geUEz9MSw9_t3rscadI91i5qJyEEtHtyMVDuOqjHINsR3QKkxcymsWRyNTVj_yQ5860-65V_lAN6LgY5ExEx3di5dOA3Doa_RUMipU_ysq8sQKTz_BTr7msOqvvaUgi2s&url=https%3A%2F%2F&content_type=application%2Fjson&http_method=GET&useDefaultOauthCred=checked&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A%2F%2Faccounts.google.com%2Fo%2Foauth2%2Fv2%2Fauth&oauthTokenEndpointValue=https%3A%2F%2Foauth2.googleapis.com%2Ftoken&oauthClientId=788021817029-v1o46f76ulabbjugao4k0t56sbimnsm9.apps.googleusercontent.com&expires_in=3598&oauthClientSecret=J6BkKMKNM0Z76-s1U_vUImgx&access_token_issue_date=1611076400&for_access_token=ya29.a0AfH6SMDaSd3riohIzeVyfI-FYuMZ8_31eQr3ySihf2geUEz9MSw9_t3rscadI91i5qJyEEtHtyMVDuOqjHINsR3QKkxcymsWRyNTVj_yQ5860-65V_lAN6LgY5ExEx3di5dOA3Doa_RUMipU_ysq8sQKTz_BTr7msOqvvaUgi2s&includeCredentials=checked&accessTokenType=bearer&autoRefreshToken=unchecked&accessType=offline&prompt=consent&response_type=code&wrapLines=on)
