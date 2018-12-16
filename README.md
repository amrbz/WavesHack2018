# Chainify.org


## SSL setup

### Self-signed

<!-- ```
openssl req -new -newkey rsa:2048 -nodes -days 365 -out api.chainify.org.crt -keyout api,chainify.org.key -subj "/C=RU/ST=/L=/O=/CN=api.chainify.org"
``` -->

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout api.chainify.org.key -out api.chainify.org.crt -subj "/C=RU/ST=/L=/O=/CN=api.chainify.org"

```


```
openssl dhparam -out dhparam.pem 2048
```