---------------- encender y desplegar Serverless---------------- 

docker-compose up -d

npx serverless@3 deploy --stage dev

--------------Sincronizar el ID de la API y actualizar S3-----------

# 1. Desplegar con Serverless y guardar el log de salida

$log = npx serverless@3 deploy --stage dev --force

# 2. Extraer el ID directamente desde la URL que devuelve Serverless en la consola

$REST_API_ID = [regex]::Match($log, 'restapis/([a-z0-9]+)/dev').Groups[1].Value

# 3. Escribir config.json

'{"apiUrl": "http://localhost:4566/restapis/' + $REST_API_ID + '/dev/_user_request_"}' | Out-File -FilePath "public/config.json" -Encoding utf8

# 4. Asegurar el bucket y sincronizar

aws --endpoint-url=http://localhost:4566 --output json s3 mb s3://mi-app-web 2>$null
aws --endpoint-url=http://localhost:4566 --output json s3 sync public/ s3://mi-app-web
