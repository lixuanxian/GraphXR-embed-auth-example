#/bin/bash
# 8080是默认的http端口，web访问使用。
## http://localhost:8080
## 默认用户名为 admin，密码为 admin
## 默认realm 账号密码为 "" ""

PROJECT_NAME=keycloak
DATA_PATH=/mnt/f/wsl-docker-containers/${PROJECT_NAME}/data/

SYSTEM="$(uname -o)"
if [ $SYSTEM == "Msys" ]
then
    export MSYS2_ARG_CONV_EXCL="*"
    DATA_PATH="$(cygpath -w $DATA_PATH)"
    echo "Msys"
else
    echo "GNU/Linux"
fi

docker rm -f ${PROJECT_NAME} 
docker run -it \
--name ${PROJECT_NAME} \
-p 8080:8080 \
-e KEYCLOAK_ADMIN=admin \
-e KEYCLOAK_ADMIN_PASSWORD=admin \
--volume ${DATA_PATH}:/opt/keycloak/data \
quay.io/keycloak/keycloak:19.0.3 start-dev