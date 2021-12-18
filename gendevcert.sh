mkdir ~/bungalow
openssl genrsa -des3 -out ~/.bungalow/rootCA.key 2048
openssl req -x509 -new -nodes -key ~/.bungalow/rootCA.key -sha256 -days 1024 -out ~/.bungalow/rootCA.pem
read -p "Trust the new certificate, then continue. See https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec"
openssl req -new -sha256 -nodes -out ~/.bungalow/server.csr -newkey rsa:2048 -keyout ~/.bungalow/server.key -config <( cat ./devserver.csr.cnf )
openssl x509 -req -in ~/.bungalow/server.csr -CA ~/.bungalow/rootCA.pem -CAkey ~/.bungalow/rootCA.key -CAcreateserial -out ~/.bungalow/server.crt -days 500 -sha256 -extfile v3.ext